const generateReceiptHTML = (data) => {

    return `
    <!DOCTYPE html>
    <html>
    
    <head>
    
    <meta charset="UTF-8" />
    
    <style>
    
    *{
    margin:0;
    padding:0;
    box-sizing:border-box;
    }
    
    body{
    
    font-family: Arial, sans-serif;
    
    background:#f3f6fb;
    
    padding:25px;
    }
    
    .receipt{
    
    width:1000px;
    
    margin:auto;
    
    background:white;
    
    border-radius:18px;
    
    overflow:hidden;
    
    border:1px solid #d8dee9;
    }
    
    /* HEADER */
    
    .header{
    
    display:flex;
    
    padding:30px;
    
    border-bottom:1px solid #d8dee9;
    }
    
    .logo-section{
    
    width:220px;
    
    text-align:center;
    
    padding-right:25px;
    
    border-right:1px solid #d8dee9;
    }
    
    .logo{
    
    width:150px;
    }
    
    .title-section{
    
    flex:1;
    
    padding-left:30px;
    }
    
    .title{
    
    font-size:52px;
    
    font-weight:800;
    
    color:#072c78;
    }
    
    .subtitle{
    
    font-size:24px;
    
    color:#666;
    
    margin-top:5px;
    }
    
    .blue-line{
    
    width:120px;
    
    height:5px;
    
    background:#072c78;
    
    margin:20px 0;
    }
    
    .company-grid{
    
    display:flex;
    
    justify-content:space-between;
    
    margin-top:10px;
    }
    
    .company-left{
    
    font-size:19px;
    
    line-height:2;
    }
    
    .company-right{
    
    font-size:19px;
    
    line-height:2;
    }
    
    .highlight{
    color:#1d4ed8;
    font-weight:bold;
    }
    
    /* SECTION */
    
    .section{
    
    margin:25px;
    
    border:1px solid #d8dee9;
    
    border-radius:14px;
    
    overflow:hidden;
    }
    
    .section-header{
    
    background:#072c78;
    
    color:white;
    
    padding:18px 24px;
    
    font-size:28px;
    
    font-weight:bold;
    
    display:flex;
    
    align-items:center;
    
    gap:12px;
    }
    
    .section-body{
    padding:30px;
    }
    
    /* LABOUR DETAILS */
    
    .labour-grid{
    
    display:grid;
    
    grid-template-columns:1fr 1fr;
    
    gap:40px;
    }
    
    .field{
    
    display:flex;
    
    justify-content:space-between;
    
    padding:16px 0;
    
    border-bottom:1px solid #eee;
    
    font-size:22px;
    }
    
    .label{
    color:#555;
    }
    
    .value{
    font-weight:bold;
    }
    
    /* SUMMARY */
    
    .summary-wrapper{
    
    display:flex;
    
    gap:25px;
    
    margin:25px;
    }
    
    .summary-box{
    
    flex:1;
    
    border:1px solid #d8dee9;
    
    border-radius:14px;
    
    overflow:hidden;
    }
    
    .summary-header{
    
    background:#072c78;
    
    color:white;
    
    padding:20px;
    
    font-size:26px;
    
    font-weight:bold;
    }
    
    .summary-body{
    padding:0;
    }
    
    /* TABLE */
    
    table{
    
    width:100%;
    
    border-collapse:collapse;
    }
    
    th{
    
    background:#072c78;
    
    color:white;
    
    padding:18px;
    
    font-size:20px;
    
    text-align:left;
    }
    
    td{
    
    padding:22px;
    
    font-size:21px;
    
    border-bottom:1px solid #ececec;
    }
    
    .amount{
    
    text-align:right;
    
    font-weight:bold;
    }
    
    .blue{
    color:#2563eb;
    }
    
    .orange{
    color:#ea580c;
    }
    
    .purple{
    color:#7e22ce;
    }
    
    .red{
    color:#dc2626;
    }
    
    .green{
    color:#15803d;
    }
    
    /* NET PAY */
    
    .net-pay{
    
    background:#edf8ef;
    
    padding:25px;
    
    display:flex;
    
    justify-content:space-between;
    
    font-size:34px;
    
    font-weight:bold;
    
    color:#15803d;
    }
    
    /* WORDS */
    
    .words{
    
    margin:25px;
    
    border:1px solid #d8dee9;
    
    border-radius:14px;
    
    padding:25px;
    }
    
    .words-title{
    
    font-size:24px;
    
    font-weight:bold;
    
    color:#072c78;
    
    margin-bottom:12px;
    }
    
    .words-text{
    
    font-size:24px;
    
    font-style:italic;
    }
    
    /* SIGNATURE */
    
    .signature{
    
    margin:25px;
    
    border:1px solid #d8dee9;
    
    border-radius:14px;
    
    display:flex;
    
    justify-content:space-between;
    
    padding:40px;
    }
    
    .sign-box{
    
    width:250px;
    
    text-align:center;
    }
    
    .sign-line{
    
    margin-top:80px;
    
    border-top:2px solid #222;
    
    padding-top:10px;
    
    font-size:20px;
    
    font-weight:bold;
    }
    
    /* FOOTER */
    
    .footer{
    
    background:#072c78;
    
    color:white;
    
    padding:18px;
    
    text-align:center;
    
    font-size:18px;
    }
    
    </style>
    
    </head>
    
    <body>
    
    <div class="receipt">
    
    <!-- HEADER -->
    
    <div class="header">
    
    <div class="logo-section">
    
    <img
    src="http://127.0.0.1:8000/public/images/logo.png"
    class="logo"
    />
    
    </div>
    
    <div class="title-section">
    
    <div class="title">
    LABOUR SALARY RECEIPT
    </div>
    
    <div class="subtitle">
    Professional Payroll Management System
    </div>
    
    <div class="blue-line"></div>
    
    <div class="company-grid">
    
    <div class="company-left">
    
    <div>
    <b>
    VC Dreams Painting Contractor
    </b>
    </div>
    
    <div>
    📍 Shiv Residency, Ahmedabad
    </div>
    
    <div>
    📞 +91 98765 43210
    </div>
    
    <div>
    ✉️ vcdreamscontractor@gmail.com
    </div>
    
    </div>
    
    <div class="company-right">
    
    <div>
    Receipt No :
    <b>
    VC/REC/2026/048
    </b>
    </div>
    
    <div>
    Generated On :
    <b>
    ${new Date().toLocaleDateString("en-GB")}
    </b>
    </div>
    
    <div>
    For Month :
    <span class="highlight">
    JUNE 2026
    </span>
    </div>
    
    </div>
    
    </div>
    
    </div>
    
    </div>
    
    <!-- LABOUR DETAILS -->
    
    <div class="section">
    
    <div class="section-header">
    👤 LABOUR DETAILS
    </div>
    
    <div class="section-body">
    
    <div class="labour-grid">
    
    <div>
    
    <div class="field">
    
    <span class="label">
    Labour Name
    </span>
    
    <span class="value">
    ${data.name}
    </span>
    
    </div>
    
    <div class="field">
    
    <span class="label">
    Assigned Site
    </span>
    
    <span class="value">
    ${data.site}
    </span>
    
    </div>
    
    </div>
    
    <div>
    
    <div class="field">
    
    <span class="label">
    Daily Wage
    </span>
    
    <span class="value">
    Rs. ${data.dailyWage}
    </span>
    
    </div>
    
    <div class="field">
    
    <span class="label">
    Total Working Days
    </span>
    
    <span class="value">
    ${data.totalDays}
    </span>
    
    </div>
    
    </div>
    
    </div>
    
    </div>
    
    </div>
    
    <!-- SUMMARY -->
    
    <div class="summary-wrapper">
    
    <!-- ATTENDANCE -->
    
    <div class="summary-box">
    
    <div class="summary-header">
    📅 ATTENDANCE SUMMARY
    </div>
    
    <div class="summary-body">
    
    <table>
    
    <tr>
    
    <td>
    
    <div style="
    display:flex;
    align-items:center;
    gap:15px;
    ">
    
    <div style="
    width:55px;
    height:55px;
    background:#eef4ff;
    border-radius:14px;
    display:flex;
    align-items:center;
    justify-content:center;
    font-size:28px;
    ">
    ☀️
    </div>
    
    <div>
    
    <div style="
    font-weight:bold;
    ">
    Day Shifts
    </div>
    
    <div style="
    font-size:15px;
    color:gray;
    ">
    Present Days
    </div>
    
    </div>
    
    </div>
    
    </td>
    
    <td class="amount blue">
    ${data.totalDays}
    </td>
    
    </tr>
    
    <tr>
    
    <td>
    
    <div style="
    display:flex;
    align-items:center;
    gap:15px;
    ">
    
    <div style="
    width:55px;
    height:55px;
    background:#f5ebff;
    border-radius:14px;
    display:flex;
    align-items:center;
    justify-content:center;
    font-size:28px;
    ">
    🌙
    </div>
    
    <div>
    
    <div style="
    font-weight:bold;
    ">
    Overtime
    </div>
    
    <div style="
    font-size:15px;
    color:gray;
    ">
    Overtime Hours
    </div>
    
    </div>
    
    </div>
    
    </td>
    
    <td class="amount purple">
    ${data.overtime}
    </td>
    
    </tr>
    
    <tr>
    
    <td>
    
    <div style="
    display:flex;
    align-items:center;
    gap:15px;
    ">
    
    <div style="
    width:55px;
    height:55px;
    background:#fff1e7;
    border-radius:14px;
    display:flex;
    align-items:center;
    justify-content:center;
    font-size:28px;
    ">
    ☕
    </div>
    
    <div>
    
    <div style="
    font-weight:bold;
    ">
    Tea Expense
    </div>
    
    <div style="
    font-size:15px;
    color:gray;
    ">
    Refreshments
    </div>
    
    </div>
    
    </div>
    
    </td>
    
    <td class="amount orange">
    Rs. ${data.totalTea}
    </td>
    
    </tr>
    
    <tr>
    
    <td>
    
    <div style="
    display:flex;
    align-items:center;
    gap:15px;
    ">
    
    <div style="
    width:55px;
    height:55px;
    background:#eefcef;
    border-radius:14px;
    display:flex;
    align-items:center;
    justify-content:center;
    font-size:28px;
    ">
    🚌
    </div>
    
    <div>
    
    <div style="
    font-weight:bold;
    ">
    Travel Fare
    </div>
    
    <div style="
    font-size:15px;
    color:gray;
    ">
    Auto / Bhada
    </div>
    
    </div>
    
    </div>
    
    </td>
    
    <td class="amount green">
    Rs. ${data.totalTravel}
    </td>
    
    </tr>
    
    </table>
    
    </div>
    
    </div>
    
    <!-- EARNINGS -->
    
    <div class="summary-box">
    
    <div class="summary-header">
    💰 EARNINGS & DEDUCTIONS
    </div>
    
    <div class="summary-body">
    
    <table>
    
    <tr>
    
    <th>
    Description
    </th>
    
    <th>
    Amount
    </th>
    
    </tr>
    
    <tr>
    
    <td>
    
    <div style="
    display:flex;
    align-items:center;
    gap:15px;
    ">
    
    <div style="
    width:55px;
    height:55px;
    background:#eef4ff;
    border-radius:14px;
    display:flex;
    align-items:center;
    justify-content:center;
    font-size:28px;
    ">
    💼
    </div>
    
    <div>
    
    <div style="
    font-weight:bold;
    ">
    Base Salary
    </div>
    
    <div style="
    font-size:15px;
    color:gray;
    ">
    Daily Wage Earnings
    </div>
    
    </div>
    
    </div>
    
    </td>
    
    <td class="amount blue">
    Rs. ${data.totalSalary}
    </td>
    
    </tr>
    
    <tr>
    
    <td>
    
    <div style="
    display:flex;
    align-items:center;
    gap:15px;
    ">
    
    <div style="
    width:55px;
    height:55px;
    background:#ffecec;
    border-radius:14px;
    display:flex;
    align-items:center;
    justify-content:center;
    font-size:28px;
    ">
    💸
    </div>
    
    <div>
    
    <div style="
    font-weight:bold;
    ">
    Advance Paid
    </div>
    
    <div style="
    font-size:15px;
    color:gray;
    ">
    Salary Deduction
    </div>
    
    </div>
    
    </div>
    
    </td>
    
    <td class="amount red">
    - Rs. ${data.totalAdvance}
    </td>
    
    </tr>
    
    </table>
    
    <div class="net-pay">
    
    <div>
    NET PAYABLE
    </div>
    
    <div>
    Rs. ${data.finalBalance}
    </div>
    
    </div>
    
    </div>
    
    </div>
    
    </div>
    
    <!-- WORDS -->
    
    <div class="words">
    
    <div class="words-title">
    🖊 AMOUNT IN WORDS
    </div>
    
    <div class="words-text">
    Rupees Only
    </div>
    
    </div>
    
    <!-- SIGNATURE -->
    
    <div class="signature">
    
    <div class="sign-box">
    
    <div class="sign-line">
    Employee Signature
    </div>
    
    </div>
    
    <div class="sign-box">
    
    <div class="sign-line">
    Authorized Signature
    </div>
    
    </div>
    
    </div>
    
    <!-- FOOTER -->
    
    <div class="footer">
    
    This is a computer generated receipt and does not require physical signature.
    
    </div>
    
    </div>
    
    </body>
    
    </html>
    `;
    };
    
    module.exports = generateReceiptHTML;