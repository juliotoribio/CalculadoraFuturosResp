document.getElementById('tipoOperacion').addEventListener('change', cambiarColorOperacion);

function formatCurrency(value) {
    return '$' + parseFloat(value).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
}

function formatPercentage(value) {
    return parseFloat(value).toFixed(2) + '%';
}

function cambiarColorOperacion() {
    const tipoOperacion = document.getElementById('tipoOperacion');
    if (tipoOperacion.value === 'short') {
        tipoOperacion.style.backgroundColor = '#E54545';
    } else {
        tipoOperacion.style.backgroundColor = '';
    }
}

function generarTablaEntradas() {
    const numeroEntradas = Number(document.getElementById('numeroEntradas').value);

    if (numeroEntradas > 10) {
        alert('El número de entradas no puede ser mayor a 10.');
        document.getElementById('numeroEntradas').value = 10;
        return;
    }

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
                <th class="entrada">Nro.</th>
                <th>Entrada</th>
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
                <td><input type="checkbox" class="entrada-checkbox" onchange="calcularPromedio()"></td>
                <td>${i + 1}</td>
                <td id="precioEntrada${i}">${formatCurrency(precio)}</td>
                <td><input type="text" class="porcentaje form-control" placeholder="Porcentaje" onblur="validateAndFormatPercentage(this)" oninput="actualizarSumaPorcentajes()"></td>
                <td id="inversionEntrada${i}"></td>
            `;
            tbody.appendChild(row);
        }
        table.appendChild(tbody);
        tablaEntradasContainer.appendChild(table);
    }

    // Mostrar el container2 después de generar la tabla
    document.getElementById('container2').style.display = 'block';

    // Restablecer valores de promedio y suma a 0
    document.getElementById('promedioEntradas').innerText = '$0.00';
    document.getElementById('sumaPorcentajes').innerText = '0.00%';
    document.getElementById('sumaTotalInversion').innerText = '$0.00';
}

function validateAndFormatPercentage(input) {
    let value = parseFloat(input.value.replace(/[^0-9.-]/g, ''));
    if (isNaN(value) || value < 0 || value > 100) {
        input.value = '';
        return;
    }
    input.value = formatPercentage(value);
    actualizarSumaPorcentajes();
}

function actualizarSumaPorcentajes() {
    const porcentajes = Array.from(document.getElementsByClassName('porcentaje')).map(input => parseFloat(input.value.replace(/[^0-9.-]/g, '')) || 0);
    const sumaPorcentajes = porcentajes.reduce((a, b) => a + b, 0);
    document.getElementById('sumaPorcentajes').innerText = `${sumaPorcentajes.toFixed(2)}%`;

    if (sumaPorcentajes > 100) {
        alert("Por favor, ingresa un porcentaje válido entre 0 y 100. La suma de los porcentajes no puede superar el 100%.");
        const lastInput = document.activeElement;
        lastInput.value = '';
    } else {
        calcularInversiones();
    }
}

function calcularInversiones() {
    const inversionTotal = parseFloat(document.getElementById('inversionTotal').value.replace(/[^0-9.-]/g, '')) || 0;
    const porcentajes = Array.from(document.getElementsByClassName('porcentaje'));

    let sumaTotalInversion = 0;

    porcentajes.forEach((input, index) => {
        const porcentaje = parseFloat(input.value.replace(/[^0-9.-]/g, '')) || 0;
        const inversion = (porcentaje / 100) * inversionTotal;
        document.getElementById(`inversionEntrada${index}`).innerText = formatCurrency(inversion);
        sumaTotalInversion += inversion;
    });

    // Actualizar suma total de inversión
    document.getElementById('sumaTotalInversion').innerText = formatCurrency(sumaTotalInversion);

    calcularPromedio();
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

    if (result.error) {
        alert(result.error);
        return;
    }

    const preciosEntrada = result.precios_entrada;
    const inversionesPorEntrada = result.inversiones_por_entrada;

    for (let i = 0; i < numeroEntradas; i++) {
        document.getElementById(`precioEntrada${i}`).innerText = formatCurrency(preciosEntrada[i]);
        document.getElementById(`inversionEntrada${i}`).innerText = formatCurrency(inversionesPorEntrada[i]);
    }

    const resultadosDiv = document.getElementById('resultados');
    resultadosDiv.innerHTML = '<h2>Resultados</h2>';
}

function calcularPromedio() {
    const checkboxes = document.querySelectorAll('.entrada-checkbox:checked');
    let sumaPonderada = 0;
    let sumaPesos = 0;

    checkboxes.forEach(checkbox => {
        const row = checkbox.closest('tr');
        const precioText = row.querySelector('[id^="precioEntrada"]').innerText;
        const precio = parseFloat(precioText.replace(/[^0-9.-]/g, ''));
        const porcentajeText = row.querySelector('.porcentaje').value;
        const porcentaje = parseFloat(porcentajeText.replace(/[^0-9.-]/g, ''));

        sumaPonderada += precio * porcentaje;
        sumaPesos += porcentaje;
    });

    if (sumaPesos === 0) {
        document.getElementById('promedioEntradas').innerText = '$0.00';
        return;
    }

    const promedioPonderado = sumaPonderada / sumaPesos;
    document.getElementById('promedioEntradas').innerText = formatCurrency(promedioPonderado);
}

document.addEventListener('DOMContentLoaded', (event) => {
    // Inicializar valores de promedio y suma a 0
    document.getElementById('promedioEntradas').innerText = '$0.00';
    document.getElementById('sumaPorcentajes').innerText = '0.00%';
    document.getElementById('sumaTotalInversion').innerText = '$0.00';

    setTimeout(() => {
        document.body.classList.add('blurred');
    }, 3000); // 3000 ms = 3 segundos
});
