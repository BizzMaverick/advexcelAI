# 📊 Large File Handling - Performance Limits

## 🚨 **Current Issue:**
- **8MB file with 15K+ rows × 30+ columns = 450,000+ DOM elements**
- **Browser crashes due to memory overload**

## ✅ **Fixes Applied:**

### **Backend Limits:**
- **File size**: 20MB max (reduced from 100MB)
- **Rows**: 1,000 max per sheet
- **Columns**: 50 max per sheet

### **Frontend Limits:**
- **Display**: Only first 100 rows shown in table
- **Memory**: Prevents browser crashes
- **User notification**: Shows "Showing first 100 rows of X total"

## 🎯 **Recommendations for Large Files:**

### **Option 1: Split Your File**
- Break 15K rows into smaller chunks (1K rows each)
- Process each chunk separately
- Combine results if needed

### **Option 2: Use Samples**
- Take first 1,000 rows for testing
- Apply AI operations to sample
- Scale to full dataset later

### **Option 3: Filter First**
- Use Excel to filter to relevant data
- Export filtered subset
- Process smaller, focused dataset

## 🔧 **Technical Limits:**
- **Browser DOM**: ~100K elements max
- **React rendering**: Performance degrades after 1K rows
- **Memory usage**: 8MB file = ~200MB RAM when rendered

## 💡 **Best Practices:**
- Keep files under 5MB for best performance
- Limit to 1,000 rows × 20 columns for smooth operation
- Use AI on focused data subsets for better results