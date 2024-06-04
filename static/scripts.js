document.getElementById('numeroEntradas').addEventListener('input', generarTablaEntradas);

function formatCurrency(value) {
    return '$' + parseFloat(value).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
}

function formatPercentage(value) {
    return parseFloat(value).toFixed(2) + '%';
}

function generarTablaEntradas() {
    const numeroEntradas = Number(document.getElementById('numeroEntradas').value);
    const tablaEntradasContainer = document.getElementById('tablaEntradasContainer');
    const precioEntrada = parseFloat(document.getElementById('precioEntrada').value.replace(/[^0-9.-]/g, ''));
    const rangoEntrada = parseFloat(document.getElementById('rangoEntrada').value.replace(/[^0-9.-]/g, '')) / 100;
    const tipoOperacion = document.getElementById('tipoOperacion').value;

    tablaEntradasContainer.innerHTML = '';

    if (numeroEntradas > 0) {
        const table = document.createElement('table');
        const thead = document.createElement('thead');
        thead.innerHTML = `
            <tr>
                <th class="entrada">Entrada</th>
                <th>Precio</th>
                <th>Porcentaje de Entrada</th>
                <th class="inversion">Inversión</th>
            </tr>
        `;
        table.appendChild(thead);

        const tbody = document.createElement('tbody');
        for (let i = 0; i < numeroEntradas; i++) {
            let precio;
            if (tipoOperacion === 'long') {
                precio = precioEntrada * (1 - (rangoEntrada / (numeroEntradas - 1)) * i);
            } else if (tipoOperacion === 'short') {
                precio = precioEntrada * (1 + (rangoEntrada / (numeroEntradas - 1)) * i);
            }

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${i + 1}</td>
                <td id="precioEntrada${i}">${formatCurrency(precio)}</td>
                <td><input type="text" class="porcentaje form-control" placeholder="Porcentaje" onblur="validateAndFormatPercentage(this)" oninput="actualizarSumaPorcentajes()"></td>
                <td id="inversionEntrada${i}"></td>
            `;
            tbody.appendChild(row);
        }
        table.appendChild(tbody);
        tablaEntradasContainer.appendChild(table);

        document.getElementById('container2').style.display = 'block';
        document.getElementById('container3').style.display = 'block';
    } else {
        document.getElementById('container2').style.display = 'none';
        document.getElementById('container3').style.display = 'none';
    }
}

function validateAndFormatPercentage(input) {
    let value = parseFloat(input.value.replace(/[^0-9.-]/g, ''));
    if (isNaN(value) || value < 0 || value > 100) {
        alert("Por favor, ingresa un porcentaje válido entre 0 y 100.");
        input.value = '';
        return;
    }
    input.value = formatPercentage(value);
    actualizarSumaPorcentajes();
}

async function calcularEntradas() {
    const tipoOperacion = document.getElementById('tipoOperacion').value;
    const numeroEntradas = Number(document.getElementById('numeroEntradas').value);
    let precioEntrada = document.getElementById('precioEntrada').value.replace(/[^0-9.-]/g, '');
    precioEntrada = parseFloat(precioEntrada);
    let rangoEntrada = document.getElementById('rangoEntrada').value.replace(/[^0-9.-]/g, '');
    rangoEntrada = parseFloat(rangoEntrada);
    let inversionTotal = document.getElementById('inversionTotal').value.replace(/[^0-9.-]/g, '');
    inversionTotal = parseFloat(inversionTotal);
    const porcentajesDistribucion = Array.from(document.getElementsByClassName('porcentaje')).map(input => parseFloat(input.value.replace(/[^0-9.-]/g, '')));

    if (isNaN(precioEntrada) || precioEntrada < 0) {
        alert("Por favor, ingresa un precio de entrada válido.");
        return;
    }

    if (isNaN(rangoEntrada) || rangoEntrada < 0) {
        alert("Por favor, ingresa un rango de entrada válido.");
        return;
    }

    const sumaPorcentajes = porcentajesDistribucion.reduce((a, b) => a + b, 0);
    if (sumaPorcentajes > 100) {
        alert("La suma de los porcentajes no puede superar el 100%");
        return;
    }

    const data = {
        tipo_operacion: tipoOperacion,
        numero_entradas: numeroEntradas,
        precio_entrada: precioEntrada,
        rango_entrada: rangoEntrada,
        inversion_total: inversionTotal,
        porcentajes_distribucion: porcentajesDistribucion
    };

    const response = await fetch('/calcular', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });

    const result = await response.json();

    const preciosEntrada = result.precios_entrada;
    const inversionesPorEntrada = result.inversiones_por_entrada;

    for (let i = 0; i < numeroEntradas; i++) {
        document.getElementById(`precioEntrada${i}`).innerText = formatCurrency(preciosEntrada[i]);
        document.getElementById(`inversionEntrada${i}`).innerText = formatCurrency(inversionesPorEntrada[i]);
    }

    const resultadosDiv = document.getElementById('resultados');
    resultadosDiv.innerHTML = '<h2>Resultados</h2>';
}
