(() => {
  const { jsPDF } = window.jspdf;
  const toastContainer = document.querySelector('.toast-container');
  const chartCtx = document.getElementById('multi-tax-chart').getContext('2d');
  let chartInstance = null;

  // Speicherung der letzten Berechnungsergebnisse pro Steuerart
  const results = {
    grundsteuer: null,
    verkaufssteuer: null,
    erbschaftsteuer: null,
    schenkungssteuer: null
  };

  function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '&times;';
    closeBtn.addEventListener('click', () => toast.remove());
    toast.appendChild(closeBtn);
    toastContainer.appendChild(toast);
    setTimeout(() => toast.remove(), 5000);
  }

  function formatCurrency(amount) {
    return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(amount);
  }

  /* ------------------- Grundsteuer ------------------- */

  function calcGrundsteuer() {
    const value = parseFloat(document.getElementById('gs-property-value').value);
    const location = document.getElementById('gs-location').value;
    const type = document.getElementById('gs-property-type').value;
    const exemptions = parseFloat(document.getElementById('gs-exemptions').value) || 0;
    const improvements = parseFloat(document.getElementById('gs-improvements').value) || 0;

    if (isNaN(value) || value <= 0) {
      showToast('Bitte gültigen Immobilienwert für Grundsteuer eingeben.');
      return null;
    }

    const taxRates = {
      residential: 0.0035,
      commercial: 0.0045,
      industrial: 0.0055,
      agricultural: 0.0020,
    };
    const multipliers = {
      urban: 1.2,
      suburban: 1.0,
      rural: 0.8,
    };

    const assessed = value * 0.7;
    const taxable = assessed + improvements - exemptions;
    const baseTax = taxable * (taxRates[type] || 0.0035);
    const finalTax = baseTax * (multipliers[location] || 1);
    const monthly = finalTax / 12;
    const ratePercent = (finalTax / value) * 100;

    const result = {
      assessed,
      taxable,
      baseTax,
      finalTax,
      monthly,
      ratePercent
    };

    results.grundsteuer = result;
    displayResult('gs-results', result, 'Grundsteuer');
    updateChart();
    return result;
  }

  function resetGrundsteuer() {
    document.getElementById('form-grundsteuer').reset();
    document.getElementById('gs-results').innerHTML = '';
    results.grundsteuer = null;
    updateChart();
  }

  /* ------------------- Verkaufssteuer ------------------- */

  function calcVerkaufssteuer() {
    const salePrice = parseFloat(document.getElementById('vs-sale-price').value);
    const purchasePrice = parseFloat(document.getElementById('vs-purchase-price').value);
    const ownUse = parseFloat(document.getElementById('vs-own-use-duration').value) || 0;

    if (isNaN(salePrice) || salePrice <= 0 || isNaN(purchasePrice) || purchasePrice <= 0) {
      showToast('Bitte gültigen Verkaufs- und Kaufpreis eingeben.');
      return null;
    }

    // Beispielhafte Annahme: Freibetrag bei Eigennutzung > 5 Jahre
    const taxableGain = salePrice - purchasePrice;
    let tax = 0;
    if (taxableGain > 0) {
      if (ownUse >= 5) {
        tax = taxableGain * 0.15 * 0.5; // 50% Steuerermäßigung bei Eigennutzung
      } else {
        tax = taxableGain * 0.15;
      }
    }

    const result = {
      taxableGain,
      tax
    };

    results.verkaufssteuer = result;
    displayResult('vs-results', result, 'Verkaufssteuer');
    updateChart();
    return result;
  }

  function resetVerkaufssteuer() {
    document.getElementById('form-verkaufssteuer').reset();
    document.getElementById('vs-results').innerHTML = '';
    results.verkaufssteuer = null;
    updateChart();
  }

  /* ------------------- Erbschaftsteuer ------------------- */

  function calcErbschaftsteuer() {
    const value = parseFloat(document.getElementById('es-property-value').value);
    const relation = document.getElementById('es-relationship').value;

    if (isNaN(value) || value <= 0) {
      showToast('Bitte gültigen Immobilienwert für Erbschaftsteuer eingeben.');
      return null;
    }

    // Beispielfreibeträge und Steuersätze
    let allowance = 0;
    let rate = 0;

    switch (relation) {
      case 'direct':
        allowance = 400000;
        rate = 0.07;
        break;
      case 'extended':
        allowance = 200000;
        rate = 0.15;
        break;
      default:
        allowance = 100000;
        rate = 0.30;
    }

    const taxable = Math.max(0, value - allowance);
    const tax = taxable * rate;

    const result = { taxable, tax };

    results.erbschaftsteuer = result;
    displayResult('es-results', result, 'Erbschaftsteuer');
    updateChart();
    return result;
  }

  function resetErbschaftsteuer() {
    document.getElementById('form-erbschaftsteuer').reset();
    document.getElementById('es-results').innerHTML = '';
    results.erbschaftsteuer = null;
    updateChart();
  }

  /* ------------------- Schenkungssteuer ------------------- */

  function calcSchenkungssteuer() {
    const value = parseFloat(document.getElementById('ss-property-value').value);
    const relation = document.getElementById('ss-relationship').value;

    if (isNaN(value) || value <= 0) {
      showToast('Bitte gültigen Wert für Schenkungssteuer eingeben.');
      return null;
    }

    let allowance = 0;
    let rate = 0;

    switch (relation) {
      case 'direct':
        allowance = 200000;
        rate = 0.07;
        break;
      case 'extended':
        allowance = 100000;
        rate = 0.15;
        break;
      default:
        allowance = 50000;
        rate = 0.30;
    }

    const taxable = Math.max(0, value - allowance);
    const tax = taxable * rate;

    const result = { taxable, tax };

    results.schenkungssteuer = result;
    displayResult('ss-results', result, 'Schenkungssteuer');
    updateChart();
    return result;
  }

  function resetSchenkungssteuer() {
    document.getElementById('form-schenkungssteuer').reset();
    document.getElementById('ss-results').innerHTML = '';
    results.schenkungssteuer = null;
    updateChart();
  }

  /* ------------------- Anzeige Ergebnis ------------------- */

  function displayResult(containerId, data, label) {
    let html = '';
    if (!data) {
      document.getElementById(containerId).innerHTML = '';
      return;
    }

    if (label === 'Grundsteuer') {
      html = `
        <div class="result-row"><strong>Steuerwert (70%):</strong> ${formatCurrency(data.assessed)}</div>
        <div class="result-row"><strong>Zu versteuernder Wert:</strong> ${formatCurrency(data.taxable)}</div>
        <div class="result-row"><strong>Jährliche Grundsteuer:</strong> ${formatCurrency(data.finalTax)}</div>
        <div class="result-row"><strong>Monatliche Rate:</strong> ${formatCurrency(data.monthly)}</div>
        <div class="result-row"><strong>Effektiver Steuersatz:</strong> ${data.ratePercent.toFixed(2)}%</div>
      `;
    } else if (label === 'Verkaufssteuer') {
      html = `
        <div class="result-row"><strong>Veräußerungsgewinn:</strong> ${formatCurrency(data.taxableGain)}</div>
        <div class="result-row"><strong>Verkaufssteuer:</strong> ${formatCurrency(data.tax)}</div>
      `;
    } else if (label === 'Erbschaftsteuer' || label === 'Schenkungssteuer') {
      html = `
        <div class="result-row"><strong>Zu versteuernder Wert:</strong> ${formatCurrency(data.taxable)}</div>
        <div class="result-row"><strong>${label}:</strong> ${formatCurrency(data.tax)}</div>
      `;
    }

    document.getElementById(containerId).innerHTML = html;
  }

  /* ------------------- Gemeinsames Chart ------------------- */

  function updateChart() {
    if (chartInstance) chartInstance.destroy();

    const grundsteuer = results.grundsteuer?.finalTax || 0;
    const verkaufssteuer = results.verkaufssteuer?.tax || 0;
    const erbschaftsteuer = results.erbschaftsteuer?.tax || 0;
    const schenkungssteuer = results.schenkungssteuer?.tax || 0;

    chartInstance = new Chart(chartCtx, {
      type: 'bar',
      data: {
        labels: ['Grundsteuer', 'Verkaufssteuer', 'Erbschaftsteuer', 'Schenkungssteuer'],
        datasets: [{
          label: 'Steuer (€)',
          data: [grundsteuer, verkaufssteuer, erbschaftsteuer, schenkungssteuer],
          backgroundColor: ['#667eea', '#ff6b6b', '#45b7d1', '#4ecdc4']
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: true, ticks: { stepSize: 5000 } }
        }
      }
    });
  }

  /* ------------------- PDF Export aller Steuerarten ------------------- */

  function exportAllToPDF() {
    try {
      const doc = new jsPDF();
      doc.setFontSize(18);
      doc.text('Immobilien-Steuer-Suite 2025', 14, 20);
      doc.setFontSize(14);
      let y = 35;

      const sections = [
        { label: 'Grundsteuer', data: results.grundsteuer },
        { label: 'Verkaufssteuer', data: results.verkaufssteuer },
        { label: 'Erbschaftsteuer', data: results.erbschaftsteuer },
        { label: 'Schenkungssteuer', data: results.schenkungssteuer },
      ];

      sections.forEach(section => {
        doc.setFontSize(16);
        doc.text(section.label, 14, y);
        y += 8;
        if (!section.data) {
          doc.setFontSize(12);
          doc.text('Keine Berechnung vorhanden', 14, y);
          y += 10;
          return;
        }
        doc.setFontSize(12);

        if (section.label === 'Grundsteuer') {
          doc.text(`Steuerwert (70%): ${formatCurrency(section.data.assessed)}`, 14, y);
          y += 7;
          doc.text(`Zu versteuernder Wert: ${formatCurrency(section.data.taxable)}`, 14, y);
          y += 7;
          doc.text(`Jährliche Grundsteuer: ${formatCurrency(section.data.finalTax)}`, 14, y);
          y += 7;
          doc.text(`Monatliche Rate: ${formatCurrency(section.data.monthly)}`, 14, y);
          y += 7;
          doc.text(`Effektiver Steuersatz: ${section.data.ratePercent.toFixed(2)}%`, 14, y);
          y += 10;
        } else if (section.label === 'Verkaufssteuer') {
          doc.text(`Veräußerungsgewinn: ${formatCurrency(section.data.taxableGain)}`, 14, y);
          y += 7;
          doc.text(`Steuer: ${formatCurrency(section.data.tax)}`, 14, y);
          y += 10;
        } else if (section.label === 'Erbschaftsteuer' || section.label === 'Schenkungssteuer') {
          doc.text(`Zu versteuernder Wert: ${formatCurrency(section.data.taxable)}`, 14, y);
          y += 7;
          doc.text(`Steuer: ${formatCurrency(section.data.tax)}`, 14, y);
          y += 10;
        }
        
        if (y > 270) { doc.addPage(); y = 20; }
      });

      doc.save('immobilien-steuern-2025.pdf');
      showToast('PDF wurde erfolgreich generiert.');
    } catch(e) {
      showToast('Fehler beim PDF-Export: ' + e.message);
    }
  }

  /* ------------- Ereignislistener setzen ------------- */

  // Grundsteuer
  document.getElementById('gs-calc-btn').addEventListener('click', calcGrundsteuer);
  document.getElementById('gs-reset-btn').addEventListener('click', resetGrundsteuer);

  // Verkaufssteuer
  document.getElementById('vs-calc-btn').addEventListener('click', calcVerkaufssteuer);
  document.getElementById('vs-reset-btn').addEventListener('click', resetVerkaufssteuer);

  // Erbschaftsteuer
  document.getElementById('es-calc-btn').addEventListener('click', calcErbschaftsteuer);
  document.getElementById('es-reset-btn').addEventListener('click', resetErbschaftsteuer);

  // Schenkungssteuer
  document.getElementById('ss-calc-btn').addEventListener('click', calcSchenkungssteuer);
  document.getElementById('ss-reset-btn').addEventListener('click', resetSchenkungssteuer);

  // PDF-Export
  document.getElementById('export-pdf').addEventListener('click', exportAllToPDF);

})();
