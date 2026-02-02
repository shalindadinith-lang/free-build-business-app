// ── Elements ───────────────────────────────────────────────────────
const $ = id => document.getElementById(id);

const els = {
  bname: $("businessName"),
  aname: $("appName"),
  logoInput: $("businessLogo"),
  color: $("primaryColor"),
  appNameDisp: $("appNameDisplay"),
  appLogo: $("appLogo"),
  itemSelect: $("itemSelect"),
  qtySpan: $("qty"),
  plus: $("plusBtn"),
  minus: $("minusBtn"),
  addBtn: $("addBtn"),
  billList: $("billList"),
  totalEl: $("total"),
  clearBtn: $("clearBtn"),
  itemName: $("itemName"),
  itemPrice: $("itemPrice"),
  saveItemBtn: $("saveItemBtn"),
  darkBtn: $("darkModeBtn"),
  downloadBtn: $("downloadHtmlBtn"),
  createBtn: $("createAppBtn"),
  pdfBtn: $("downloadPdfBtn"),
  productList: $("productList"),
  // Customer defaults
  defaultCustomerName: $("defaultCustomerName"),
  defaultCustomerPhone: $("defaultCustomerPhone"),
  defaultCustomerAddress: $("defaultCustomerAddress"),
  // Bank details
  bankName: $("bankName"),
  accountName: $("accountName"),
  accountNumber: $("accountNumber"),
  bankExtra: $("bankExtra"),
};

// ── State ──────────────────────────────────────────────────────────
let qty = 1;
let cartTotal = 0;
let items = JSON.parse(localStorage.getItem("shopItems")) || [];
let logoDataUrl = localStorage.getItem("shopLogo") || "";
let cartItems = [];

// ── Init ───────────────────────────────────────────────────────────
function init() {
  els.bname.value = localStorage.getItem("shopName") || "Dinith Lights";
  els.aname.value = localStorage.getItem("shopAppName") || "JJ Online";
  els.color.value = localStorage.getItem("shopColor") || "#f44336";

  // Customer defaults
  els.defaultCustomerName.value    = localStorage.getItem("defaultCustomerName")    || "";
  els.defaultCustomerPhone.value   = localStorage.getItem("defaultCustomerPhone")   || "";
  els.defaultCustomerAddress.value = localStorage.getItem("defaultCustomerAddress") || "";

  // Bank details
  els.bankName.value      = localStorage.getItem("bankName")      || "";
  els.accountName.value   = localStorage.getItem("accountName")   || "";
  els.accountNumber.value = localStorage.getItem("accountNumber") || "";
  els.bankExtra.value     = localStorage.getItem("bankExtra")     || "";

  if (logoDataUrl) {
    els.appLogo.src = logoDataUrl;
    els.appLogo.style.display = "block";
  }

  document.documentElement.style.setProperty("--primary", els.color.value);

  loadItems();
  renderProductList();
  updatePreview();
  updateTotal();
}

function saveCoreState() {
  localStorage.setItem("shopName", els.bname.value.trim());
  localStorage.setItem("shopAppName", els.aname.value.trim());
  localStorage.setItem("shopColor", els.color.value);
  localStorage.setItem("shopItems", JSON.stringify(items));
  if (logoDataUrl) localStorage.setItem("shopLogo", logoDataUrl);

  // Save customer & bank
  localStorage.setItem("defaultCustomerName",    els.defaultCustomerName.value.trim());
  localStorage.setItem("defaultCustomerPhone",   els.defaultCustomerPhone.value.trim());
  localStorage.setItem("defaultCustomerAddress", els.defaultCustomerAddress.value.trim());
  localStorage.setItem("bankName",      els.bankName.value.trim());
  localStorage.setItem("accountName",   els.accountName.value.trim());
  localStorage.setItem("accountNumber", els.accountNumber.value.trim());
  localStorage.setItem("bankExtra",     els.bankExtra.value.trim());
}

// ── Logo ───────────────────────────────────────────────────────────
els.logoInput.onchange = e => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    logoDataUrl = ev.target.result;
    els.appLogo.src = logoDataUrl;
    els.appLogo.style.display = "block";
    saveCoreState();
    updatePreview();
  };
  reader.readAsDataURL(file);
};

// ── Live preview updates ──────────────────────────────────────────
function updatePreview() {
  els.appNameDisp.textContent = els.aname.value.trim() || "My Business";
  document.documentElement.style.setProperty("--primary", els.color.value);
}

els.createBtn.onclick = () => {
  updatePreview();
  saveCoreState();
  alert("Preview updated!");
};

// ── Quantity ──────────────────────────────────────────────────────
els.plus.onclick = () => els.qtySpan.textContent = ++qty;
els.minus.onclick = () => { if (qty > 1) els.qtySpan.textContent = --qty; };

// ── Products ──────────────────────────────────────────────────────
function loadItems() {
  els.itemSelect.innerHTML = '<option value="">— choose item —</option>';
  items.forEach((it, i) => {
    const opt = document.createElement("option");
    opt.value = i;
    opt.textContent = `${it.name} - Rs.${Number(it.price).toFixed(2)}`;
    els.itemSelect.appendChild(opt);
  });
}

function renderProductList() {
  if (!els.productList) return;
  els.productList.innerHTML = "";
  items.forEach((item, index) => {
    const li = document.createElement("li");
    li.style.cssText = "padding:0.8rem; background:#f1f5f9; margin:0.4rem 0; border-radius:8px; display:flex; justify-content:space-between; align-items:center;";
    li.innerHTML = `
      <span>${item.name} - Rs.${Number(item.price).toFixed(2)}</span>
      <button style="background:#ef4444; color:white; border:none; padding:0.4rem 0.8rem; border-radius:6px; cursor:pointer;" data-index="${index}">Remove</button>
    `;
    els.productList.appendChild(li);
  });

  els.productList.querySelectorAll("button").forEach(btn => {
    btn.onclick = () => {
      const idx = parseInt(btn.dataset.index);
      if (confirm("Remove " + items[idx].name + "?")) {
        items.splice(idx, 1);
        saveCoreState();
        loadItems();
        renderProductList();
      }
    };
  });
}

els.saveItemBtn.onclick = () => {
  const name = els.itemName.value.trim();
  const price = parseFloat(els.itemPrice.value);
  if (!name || isNaN(price) || price <= 0) {
    alert("Please enter valid name and price");
    return;
  }
  items.push({ name, price });
  saveCoreState();
  els.itemName.value = "";
  els.itemPrice.value = "";
  loadItems();
  renderProductList();
  alert("Item added!");
};

// ── Cart ──────────────────────────────────────────────────────────
els.addBtn.onclick = () => {
  const idx = els.itemSelect.value;
  if (idx === "") return alert("Select an item first");
  const item = items[idx];
  const price = item.price * qty;
  cartTotal += price;
  cartItems.push({ name: item.name, qty, price: item.price });
  const li = document.createElement("li");
  li.textContent = `${item.name} × ${qty} = Rs.${price.toFixed(2)}`;
  els.billList.appendChild(li);
  updateTotal();
};

function updateTotal() {
  els.totalEl.textContent = cartTotal.toFixed(2);
}

els.clearBtn.onclick = () => {
  els.billList.innerHTML = "";
  cartTotal = 0;
  cartItems = [];
  updateTotal();
};

// ── Dark mode ─────────────────────────────────────────────────────
els.darkBtn.onclick = () => {
  document.body.classList.toggle("dark");
};

// ── PDF Invoice Generation ────────────────────────────────────────
els.pdfBtn.onclick = () => {
  if (cartItems.length === 0) {
    alert("කරුණාකර භාණ්ඩ කිහිපයක් එකතු කරන්න!");
    return;
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();   // ← මෙතනින් doc හදනවා

  const primaryHex = els.color.value;
  const primaryRGB = primaryHex.match(/\w\w/g).map(x => parseInt(x, 16));
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  let y = margin;

  // Header - Logo + Title
  if (logoDataUrl) {
    try {
      doc.addImage(logoDataUrl, 'PNG', margin, y, 40, 40);
    } catch (err) {
      console.warn("Logo issue:", err);
    }
  }

  doc.setFontSize(22);
  doc.setTextColor(...primaryRGB);
  doc.setFont("helvetica", "bold");
  doc.text("INVOICE", pageWidth / 2, y + 25, { align: "center" });
  y += 50;

  // Business details
  doc.setFontSize(14);
  doc.setTextColor(0);
  doc.text(els.bname.value.trim() || "Dinith Lights", pageWidth / 2, y, { align: "center" });
  y += 8;

  //doc.setFontSize(10);
 // doc.setTextColor(80);
 // doc.text("Colombo, Sri Lanka | Contact: +94 XX XXX XXXX", pageWidth / 2, y, { align: "center" });
 // y += 15;

  // Invoice No & Date
  doc.setFontSize(11);
  const today = new Date().toLocaleDateString('si-LK');
  const invoiceNo = "INV-" + String(Math.floor(Math.random() * 9000) + 1000);
  doc.text(`Invoice No: ${invoiceNo}`, margin, y);
  doc.text(`Date: ${today}`, pageWidth - margin, y, { align: "right" });
  y += 15;

  // Customer Section
  doc.setFontSize(12);
  doc.setTextColor(0);
  doc.text("INVOICE TO:", margin, y);
  y += 8;

  doc.setFontSize(10);
  doc.setTextColor(60);

  const custName = els.defaultCustomerName.value.trim() || "Customer";
  const custPhone = els.defaultCustomerPhone.value.trim();
  const custAddress = els.defaultCustomerAddress.value.trim();

  doc.text(custName, margin, y);
  y += 6;
  if (custPhone) {
    doc.text(custPhone, margin, y);
    y += 6;
  }
  if (custAddress) {
    const lines = custAddress.split('\n');
    lines.forEach(line => {
      if (line.trim()) {
        doc.text(line.trim(), margin, y);
        y += 6;
      }
    });
  }
  y += 12;

  // Items Table
  const tableColumn = ["No.", "Description", "Qty", "Price", "Total"];
  const tableRows = cartItems.map((item, i) => [
    i + 1,
    item.name,
    item.qty,
    `Rs. ${item.price.toFixed(2)}`,
    `Rs. ${(item.price * item.qty).toFixed(2)}`
  ]);

  doc.autoTable({
    startY: y,
    head: [tableColumn],
    body: tableRows,
    theme: 'grid',
    headStyles: { fillColor: primaryRGB, textColor: 255, fontStyle: 'bold', halign: 'center' },
    styles: { fontSize: 10, cellPadding: 4 },
    columnStyles: {
      0: { cellWidth: 15, halign: 'center' },
      1: { cellWidth: 80 },
      2: { cellWidth: 20, halign: 'center' },
      3: { cellWidth: 30, halign: 'right' },
      4: { cellWidth: 35, halign: 'right' }
    },
    margin: { left: margin, right: margin }
  });

  y = doc.lastAutoTable.finalY + 15;

  // Totals
  const subtotal = cartTotal;
  const tax = 0; // Change if needed
  const grandTotal = subtotal + tax;

  doc.setFontSize(11);
  doc.text("Subtotal", pageWidth - 80, y);
  doc.text(`Rs. ${subtotal.toFixed(2)}`, pageWidth - margin, y, { align: "right" });
  y += 8;

  doc.text("Tax (0%)", pageWidth - 80, y);
  doc.text(`Rs. ${tax.toFixed(2)}`, pageWidth - margin, y, { align: "right" });
  y += 10;

  doc.setLineWidth(0.5);
  doc.line(margin, y - 2, pageWidth - margin, y - 2);
  y += 8;

  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text("Grand Total", pageWidth - 80, y);
  doc.text(`Rs. ${grandTotal.toFixed(2)}`, pageWidth - margin, y, { align: "right" });
  y += 20;

  // Payment Info
  doc.setFontSize(10);
  doc.setTextColor(80);
  doc.text("PAYMENT INFORMATION", margin, y);
  y += 8;

  if (els.bankName.value.trim()) doc.text(`Bank: ${els.bankName.value.trim()}`, margin, y), y += 6;
  if (els.accountName.value.trim()) doc.text(`A/C Name: ${els.accountName.value.trim()}`, margin, y), y += 6;
  if (els.accountNumber.value.trim()) doc.text(`A/C No: ${els.accountNumber.value.trim()}`, margin, y), y += 6;
  if (els.bankExtra.value.trim()) doc.text(els.bankExtra.value.trim(), margin, y), y += 6;

  y += 12;
  doc.setFontSize(11);
  doc.setTextColor(...primaryRGB);
  doc.text("Thank you for your order! Come again.", pageWidth / 2, y, { align: "center" });

  // Save
  const fileName = `invoice_${els.aname.value.trim() || "business"}_${today.replace(/\//g,'-')}.pdf`;
  doc.save(fileName);
};

// ── Download full standalone app HTML (updated PDF too) ────────────
els.downloadBtn.onclick = () => {
  if (items.length === 0) {
    alert("Please add at least one item first.");
    return;
  }

  const logo = logoDataUrl || "";

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${els.aname.value.trim() || "Business App"}</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box;font-family:system-ui,sans-serif}
    :root{--c:${els.color.value};--bg:#f9fafb;--text:#111;--card:#fff;--soft:#6b7280;--shadow:0 6px 20px rgba(0,0,0,0.1)}
    body{background:var(--bg);color:var(--text);min-height:100vh}
    header{background:var(--c);color:white;padding:2.4rem 1rem;text-align:center;box-shadow:0 8px 24px rgba(0,0,0,0.2)}
    .logo{max-width:160px;border-radius:24px;margin:1.5rem auto;display:block;box-shadow:var(--shadow)}
    .content{max-width:560px;margin:0 auto;padding:2.4rem}
    select,button,input,textarea{width:100%;padding:1.2rem;margin:1rem 0;border-radius:18px;font-size:1.15rem;border:1px solid #d1d5db}
    button{background:var(--c);color:white;border:none;cursor:pointer;font-weight:600;box-shadow:var(--shadow)}
    button:hover{filter:brightness(1.08)}
    .qty{display:flex;gap:2rem;justify-content:center;align-items:center;margin:1.8rem 0}
    .qty button{width:70px;height:70px;border-radius:50%;font-size:2.4rem;background:#f3f4f6;border:none;cursor:pointer}
    .qty span{font-size:3rem;min-width:80px;text-align:center;color:var(--c);font-weight:700}
    ul{list-style:none;margin:2rem 0;padding:0}
    li{background:#fff;padding:1.4rem;margin:1rem 0;border-radius:18px;box-shadow:var(--shadow);font-size:1.15rem}
    .total{font-size:2.2rem;font-weight:700;margin:2.5rem 0;text-align:center;color:#c53030}
    .clear{background:#ef4444}
  </style>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js"></script>
</head>
<body>
<header>
  ${logo ? `<img src="${logo}" class="logo">` : ""}
  <h1>${els.bname.value.trim() || "My Shop"}</h1>
  <p>${els.aname.value.trim() || "Order Now"}</p>
</header>
<div class="content">
  <select id="s"><option value="">— choose product —</option>${items.map((it,i)=>`<option value="${i}">${it.name} – Rs.${it.price.toFixed(2)}</option>`).join("")}</select>
  <div class="qty">
    <button onclick="if(q>1)qSpan.textContent=--q">-</button>
    <span id="qSpan">1</span>
    <button onclick="qSpan.textContent=++q">+</button>
  </div>
  <button onclick="add()">Add to Order</button>
  <ul id="bill"></ul>
  <p class="total">Total: Rs <span id="tot">0.00</span></p>
  <button class="clear" onclick="clearOrder()">Clear Order</button>
  <button onclick="generatePdf()" style="background:#2196f3; margin-top:1rem">Download Invoice (PDF)</button>
</div>
<script>
let q=1, cart=[], total=0;
const qSpan=document.getElementById('qSpan'), s=document.getElementById('s'), bill=document.getElementById('bill'), tot=document.getElementById('tot');
const items=${JSON.stringify(items)};
const logo="${logo}";
function add(){let idx=s.value;if(!idx)return;let it=items[idx];let p=it.price*q;total+=p;tot.textContent=total.toFixed(2);let li=document.createElement('li');li.textContent=\`\${it.name} × \${q} = Rs.\${p.toFixed(2)}\`;bill.appendChild(li);cart.push({name:it.name,qty:q,price:it.price});q=1;qSpan.textContent=1}
function clearOrder(){bill.innerHTML='';total=0;tot.textContent='0.00';cart=[]}
function generatePdf(){
  if(cart.length===0)return alert("Add items first");
  const {jsPDF}=window.jspdf;
  const doc=new jsPDF();
  let y=15;
  const pageWidth=doc.internal.pageSize.getWidth();
  const margin=15;
  if(logo){try{doc.addImage(logo,'PNG',margin,y,40,40)}catch(e){}}
  doc.setFontSize(22);doc.setTextColor(244,67,54);doc.text("INVOICE",pageWidth/2,y+25,{align:"center"});y+=50;
  doc.setFontSize(14);doc.setTextColor(0);doc.text("Your Business Name",pageWidth/2,y,{align:"center"});y+=15;
  const today=new Date().toLocaleDateString();const inv="INV-"+Math.floor(Math.random()*9000+1000);
  doc.setFontSize(11);doc.text("Invoice No: "+inv,margin,y);doc.text("Date: "+today,pageWidth-margin,y,{align:"right"});y+=15;
  doc.setFontSize(12);doc.text("INVOICE TO:",margin,y);y+=10;
  doc.setFontSize(10);doc.text("Customer Name",margin,y);y+=15;
  cart.forEach((it,i)=>{doc.text((i+1)+". "+it.name+" x "+it.qty,margin,y);doc.text("Rs."+(it.price*it.qty).toFixed(2),pageWidth-margin,y,{align:"right"});y+=10});
  y+=10;doc.text("Total: Rs."+total.toFixed(2),pageWidth-margin,y,{align:"right"});
  doc.save("invoice.pdf");
}
</script>
</body>
</html>`;

  const blob = new Blob([html], {type: "text/html"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = (els.aname.value.trim().replace(/\s+/g, "_") || "business-app") + ".html";
  a.click();
  URL.revokeObjectURL(url);
};

// ── Start ─────────────────────────────────────────────────────────
init();

