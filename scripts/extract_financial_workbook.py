from __future__ import annotations

import json
import zipfile
import xml.etree.ElementTree as ET
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
WORKBOOK_PATH = ROOT / "assets" / "downloads" / "nepal_airlines_financial_tables.xlsx"
OUTPUT_PATH = ROOT / "assets" / "financial-data.js"

NS = {
    "main": "http://schemas.openxmlformats.org/spreadsheetml/2006/main",
    "rel": "http://schemas.openxmlformats.org/officeDocument/2006/relationships",
}


def read_workbook(path: Path) -> dict[str, list[list[str | None]]]:
    with zipfile.ZipFile(path) as archive:
        workbook_root = ET.fromstring(archive.read("xl/workbook.xml"))
        rels_root = ET.fromstring(archive.read("xl/_rels/workbook.xml.rels"))
        rel_map = {rel.attrib["Id"]: rel.attrib["Target"] for rel in rels_root}
        shared_strings = read_shared_strings(archive)
        sheets: dict[str, list[list[str | None]]] = {}

        for sheet in workbook_root.find("main:sheets", NS):
            name = sheet.attrib["name"]
            rel_id = sheet.attrib["{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id"]
            target = "xl/" + rel_map[rel_id]
            sheet_root = ET.fromstring(archive.read(target))
            rows: list[list[str | None]] = []
            sheet_data = sheet_root.find("main:sheetData", NS)
            if sheet_data is None:
                sheets[name] = rows
                continue

            for row in sheet_data.findall("main:row", NS):
                values: list[str | None] = []
                for cell in row.findall("main:c", NS):
                    values.append(read_cell_value(cell, shared_strings))
                rows.append(values)

            sheets[name] = rows

        return sheets


def read_shared_strings(archive: zipfile.ZipFile) -> list[str]:
    if "xl/sharedStrings.xml" not in archive.namelist():
        return []

    shared_root = ET.fromstring(archive.read("xl/sharedStrings.xml"))
    strings: list[str] = []
    for item in shared_root.findall("main:si", NS):
        strings.append("".join(node.text or "" for node in item.iterfind(".//main:t", NS)))
    return strings


def read_cell_value(cell: ET.Element, shared_strings: list[str]) -> str | None:
    cell_type = cell.attrib.get("t")
    value_node = cell.find("main:v", NS)
    if cell_type == "inlineStr":
      inline = cell.find("main:is", NS)
      if inline is None:
          return ""
      return "".join(node.text or "" for node in inline.iterfind(".//main:t", NS))
    if value_node is None:
        return None
    if cell_type == "s":
        return shared_strings[int(value_node.text)]
    return value_node.text


def rows_to_statement(rows: list[list[str | None]], header_row_idx: int, data_start_idx: int, period_row_idx: int | None = None) -> dict:
    headers = [clean_text(value) for value in rows[header_row_idx]]
    if period_row_idx is None:
        periods = headers[1:]
    else:
        periods = [clean_text(value) for value in rows[period_row_idx]][1:]
    line_items = []
    for row in rows[data_start_idx:]:
        if not row or all(value is None for value in row):
            continue
        label = clean_text(row[0]) if len(row) > 0 else ""
        if not label:
            continue
        values = [parse_number(value) for value in row[1:1 + len(periods)]]
        line_items.append({
            "label": label,
            "values": values,
        })
    return {
        "headers": headers,
        "periods": periods,
        "lineItems": line_items,
    }


def build_output(sheets: dict[str, list[list[str | None]]]) -> dict:
    financial_position = rows_to_statement(sheets["Financial_Position"], 4, 6, period_row_idx=5)
    profit_loss = rows_to_statement(sheets["Profit_Loss"], 4, 5)
    comprehensive_income = rows_to_statement(sheets["Comprehensive_Income"], 4, 5)
    cash_flows = rows_to_statement(sheets["Cash_Flows"], 4, 5)
    changes_equity_py = rows_to_matrix(sheets["Changes_Equity_PY"], 6)
    changes_equity_cy = rows_to_matrix(sheets["Changes_Equity_CY"], 6)

    periods = {
        "financialPosition": financial_position["periods"],
        "profitLoss": ["Ashadh 31, 2080", "Ashadh 32, 2079"],
        "comprehensiveIncome": ["Ashadh 31, 2080", "Ashadh 32, 2079"],
        "cashFlows": ["Ashadh 31, 2080", "Ashadh 32, 2079"],
    }

    latest_period = "Ashadh 31, 2080 / July 16, 2023"
    previous_period = "Ashadh 32, 2079"
    restated_period = "Ashadh 31, 2078"

    kpis = {
        "revenue": statement_value(profit_loss, "Revenue from Operation", 0),
        "operatingExpenditure": statement_value(profit_loss, "Total expenditure on operations before exceptional items", 0),
        "costOfSales": statement_value(profit_loss, "Cost of Sales", 0),
        "netProfitLoss": statement_value(profit_loss, "Profit/(Loss) after Tax", 0),
        "cashAndCashEquivalents": statement_value(financial_position, "Cash and Cash Equivalents", 0),
        "totalAssets": statement_value(financial_position, "Total Assets", 0),
        "totalEquity": statement_value(financial_position, "Total Equity", 0),
        "totalLiabilities": statement_value(financial_position, "Total Assets", 0) - statement_value(financial_position, "Total Equity", 0),
    }

    chart_series = {
        "revenueVsExpenditure": {
            "labels": ["Ashadh 31, 2080", "Ashadh 32, 2079"],
            "revenue": [
                statement_value(profit_loss, "Revenue from Operation", 0),
                statement_value(profit_loss, "Revenue from Operation", 1),
            ],
            "expenditure": [
                statement_value(profit_loss, "Cost of Sales", 0) + statement_value(profit_loss, "Total expenditure on operations before exceptional items", 0),
                statement_value(profit_loss, "Cost of Sales", 1) + statement_value(profit_loss, "Total expenditure on operations before exceptional items", 1),
            ],
        },
        "netProfitLoss": {
            "labels": ["Ashadh 31, 2080", "Ashadh 32, 2079"],
            "values": [
                statement_value(profit_loss, "Profit/(Loss) after Tax", 0),
                statement_value(profit_loss, "Profit/(Loss) after Tax", 1),
            ],
        },
        "cashAndCashEquivalents": {
            "labels": ["Ashadh 31, 2080", "Ashadh 32, 2079", "Ashadh 31, 2078"],
            "values": [
                statement_value(financial_position, "Cash and Cash Equivalents", 0),
                statement_value(financial_position, "Cash and Cash Equivalents", 1),
                statement_value(financial_position, "Cash and Cash Equivalents", 2),
            ],
        },
        "assetsLiabilitiesEquity": {
            "labels": ["Ashadh 31, 2080", "Ashadh 32, 2079", "Ashadh 31, 2078"],
            "assets": [
                statement_value(financial_position, "Total Assets", 0),
                statement_value(financial_position, "Total Assets", 1),
                statement_value(financial_position, "Total Assets", 2),
            ],
            "liabilities": [
                statement_value(financial_position, "Total Assets", 0) - statement_value(financial_position, "Total Equity", 0),
                statement_value(financial_position, "Total Assets", 1) - statement_value(financial_position, "Total Equity", 1),
                statement_value(financial_position, "Total Assets", 2) - statement_value(financial_position, "Total Equity", 2),
            ],
            "equity": [
                statement_value(financial_position, "Total Equity", 0),
                statement_value(financial_position, "Total Equity", 1),
                statement_value(financial_position, "Total Equity", 2),
            ],
        },
    }

    return {
        "meta": {
            "title": "Financial Data & Insights",
            "entity": "Nepal Airlines Company",
            "workbook": "assets/downloads/nepal_airlines_financial_tables.xlsx",
            "sourceNote": "Workbook is a reconstructed/extracted financial dataset. Displayed figures are sourced from the workbook currently available, which references a duplicated PDF source within the file.",
            "validationNote": "Some values may have been manually transcribed and/or validated within the reconstructed workbook source.",
            "availableYears": [latest_period, previous_period, restated_period],
            "workbookSheets": list(sheets.keys()),
        },
        "periods": periods,
        "kpis": kpis,
        "chartSeries": chart_series,
        "statements": {
            "financialPosition": financial_position,
            "profitLoss": profit_loss,
            "comprehensiveIncome": comprehensive_income,
            "cashFlows": cash_flows,
            "changesEquityPreviousYear": changes_equity_py,
            "changesEquityCurrentYear": changes_equity_cy,
        },
    }


def rows_to_matrix(rows: list[list[str | None]], header_row_idx: int) -> dict:
    headers = [clean_text(value) for value in rows[header_row_idx]]
    data_rows = []
    for row in rows[header_row_idx + 1:]:
        if not row or all(value is None for value in row):
            continue
        cleaned = [clean_text(value) if idx == 0 else parse_number(value) if value not in (None, "") else None for idx, value in enumerate(row)]
        if not cleaned[0]:
            continue
        data_rows.append(cleaned)
    return {
        "headers": headers,
        "rows": data_rows,
    }


def statement_value(statement: dict, label: str, period_index: int) -> int:
    for item in statement["lineItems"]:
        if item["label"] == label:
            return int(item["values"][period_index] or 0)
    raise KeyError(f"Missing statement label: {label}")


def parse_number(value: str | None) -> int | None:
    if value in (None, ""):
        return None
    return int(float(value))


def clean_text(value: str | None) -> str:
    return "" if value is None else str(value).strip()


def main() -> None:
    workbook = read_workbook(WORKBOOK_PATH)
    payload = build_output(workbook)
    OUTPUT_PATH.write_text(
        "'use strict';\n\nwindow.SKYAUDIT_FINANCIAL_DATA = " + json.dumps(payload, ensure_ascii=True, indent=2) + ";\n",
        encoding="utf-8",
    )


if __name__ == "__main__":
    main()
