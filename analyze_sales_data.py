import pandas as pd
import numpy as np
from pathlib import Path

def analyze_excel_file(file_path):
    """Analyze Excel file structure and content"""
    try:
        # Read the Excel file
        excel_file = pd.ExcelFile(file_path)
        
        print(f"📊 SALES DATA ANALYSIS")
        print(f"File: {Path(file_path).name}")
        print(f"=" * 50)
        
        # Show sheet names
        print(f"📋 Sheets: {excel_file.sheet_names}")
        
        # Analyze each sheet
        for sheet_name in excel_file.sheet_names:
            print(f"\n🔍 SHEET: {sheet_name}")
            print("-" * 30)
            
            # Read the sheet
            df = pd.read_excel(file_path, sheet_name=sheet_name)
            
            # Basic info
            print(f"Dimensions: {df.shape[0]} rows × {df.shape[1]} columns")
            print(f"Columns: {list(df.columns)}")
            
            # Show first few rows
            print(f"\nFirst 5 rows:")
            print(df.head())
            
            # Data types
            print(f"\nData Types:")
            for col, dtype in df.dtypes.items():
                print(f"  {col}: {dtype}")
            
            # Basic statistics for numeric columns
            numeric_cols = df.select_dtypes(include=[np.number]).columns
            if len(numeric_cols) > 0:
                print(f"\nNumeric Summary:")
                print(df[numeric_cols].describe())
            
            # Check for missing values
            missing = df.isnull().sum()
            if missing.sum() > 0:
                print(f"\nMissing Values:")
                for col, count in missing.items():
                    if count > 0:
                        print(f"  {col}: {count}")
            
            # Unique values for categorical columns
            categorical_cols = df.select_dtypes(include=['object']).columns
            print(f"\nCategorical Data:")
            for col in categorical_cols:
                unique_count = df[col].nunique()
                print(f"  {col}: {unique_count} unique values")
                if unique_count <= 10:
                    print(f"    Values: {list(df[col].unique())}")
        
        print(f"\n🎯 POTENTIAL ANALYTICS QUESTIONS:")
        print("=" * 50)
        
        # Generate potential questions based on common sales data patterns
        questions = [
            "📈 Sales Performance:",
            "  • What are the total sales by month/quarter?",
            "  • Which products/categories have highest revenue?",
            "  • What's the sales trend over time?",
            "  • Which regions/territories perform best?",
            "",
            "🎯 Customer Analysis:",
            "  • Who are the top customers by revenue?",
            "  • What's the customer acquisition trend?",
            "  • Which customer segments are most profitable?",
            "",
            "📊 Product Analysis:",
            "  • What are the best-selling products?",
            "  • Which products have highest profit margins?",
            "  • What's the product performance comparison?",
            "",
            "💰 Financial Insights:",
            "  • What's the revenue vs profit analysis?",
            "  • How do costs impact profitability?",
            "  • What are the seasonal patterns?",
            "",
            "🔍 Operational Metrics:",
            "  • What's the average order value?",
            "  • How many units sold per transaction?",
            "  • What's the sales conversion rate?",
        ]
        
        for question in questions:
            print(question)
            
    except Exception as e:
        print(f"Error analyzing file: {e}")

if __name__ == "__main__":
    file_path = r"C:\Users\kynandan\Downloads\Sales Data Aug- Mar.xlsx"
    analyze_excel_file(file_path)