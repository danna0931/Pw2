let csvData = [];
let modoBorrar = false;

function Menup(action) {
    const actions = document.querySelectorAll('.action');
    actions.forEach(act => act.style.display = 'none');
    document.getElementById(action).style.display = 'block';
    
    if (action === 'borrar') {
        document.getElementById('deleteButtons').style.display = 'block';
        modoBorrar  = true;
    } else {
        document.getElementById('deleteButtons').style.display = 'none';
        modoBorrar  = false;
    }
}


// LEER

function leerCSV() {
    const input = document.getElementById('csvFileInput');
    if (!input.files.length) {
        alert("Selecciona un archivo CSV.");
        return;
    }

    const file = input.files[0];
    const reader = new FileReader();

    reader.onload = function(e) {
        const text = e.target.result;
        csvData = parseCSV(text);
        MostrarCSV(csvData, 'csvContent');
    };

    reader.readAsText(file);
}

function parseCSV(text) {
    const lines = text.split('\n').filter(line => line.trim() !== '');
    const headers = lines[0].split(',');
    return lines.slice(1).map(line => {
        const values = line.split(',');
        let obj = {};
        headers.forEach((header, index) => {
            obj[header.trim()] = values[index].trim();
        });
        return obj;
    });
}

function MostrarCSV(data, divId, editar = false, BorrarC = false) {
    const contentDiv = document.getElementById(divId);
    if (data.length === 0) {
        contentDiv.innerHTML = '<p>No hay datos para mostrar.</p>';
        return;
    }
    
    const table = document.createElement('table');
    const headers = Object.keys(data[0]);
    const headerRow = document.createElement('tr');
    headers.forEach(header => {
        const th = document.createElement('th');
        th.textContent = header;
        headerRow.appendChild(th);
    });

    if (BorrarC) {
        const th = document.createElement('th');
        th.textContent = 'Eliminar';
        headerRow.appendChild(th);
    }

    table.appendChild(headerRow);

    data.forEach((row, rowIndex) => {
        const tr = document.createElement('tr');
        headers.forEach(header => {
            const td = document.createElement('td');
            if (editar) {
                const input = document.createElement('input');
                input.value = row[header] || '';
                input.addEventListener('input', function() {
                    data[rowIndex][header] = input.value;
                });
                td.appendChild(input);
            } else {
                td.textContent = row[header];
            }
            tr.appendChild(td);
        });

        if (BorrarC) {
            const deleteButtonCell = document.createElement('td');
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Eliminar';
            deleteButton.addEventListener('click', function() {
                eliminarFila(row);
            });
            deleteButtonCell.appendChild(deleteButton);
            tr.appendChild(deleteButtonCell);
        }

        table.appendChild(tr);
    });

    contentDiv.innerHTML = '';
    contentDiv.appendChild(table);
}

// INSERTAR

function agregarDatosCSV() {
    const input = document.getElementById('csvFileInputAgregar');
    if (!input.files.length) {
        alert("Por favor, selecciona un archivo CSV.");
        return;
    }

    const file = input.files[0];
    const reader = new FileReader();

    reader.onload = function(e) {
        const text = e.target.result;
        csvData = parseCSV(text);
        csvData.push({}); // Añadir una fila en blanco
        MostrarCSV(csvData, 'csvContentAgregar', true);
    };

    reader.readAsText(file);
}

function guardarDatos() {
    const inputs = document.querySelectorAll('#csvContentAgregar input');
    const newRow = {};
    inputs.forEach(input => {
        newRow[input.getAttribute('name')] = input.value;
    });
    csvData.push(newRow);
    const csvContent = convertirCSV(csvData);
    downloadCSV(csvContent, 'nuevo_archivo.csv');
}

function agregarFila() {
    const table = document.querySelector('#csvContentAgregar table');
    const headers = Object.keys(csvData[0]);
    const newRow = document.createElement('tr');
    
    headers.forEach(header => {
        const td = document.createElement('td');
        const input = document.createElement('input');
        input.setAttribute('name', header);
        td.appendChild(input);
        newRow.appendChild(td);
    });

    table.appendChild(newRow);
}

// BORRAR
function borrarDatosCSV() {
    const input = document.getElementById('csvFileInputBorrar');
    if (!input.files.length) {
        alert("Por favor, selecciona un archivo CSV.");
        return;
    }

    const file = input.files[0];
    const reader = new FileReader();

    reader.onload = function(e) {
        const text = e.target.result;
        csvData = parseCSV(text);
        MostrarCSV(csvData, 'csvContentBorrar', false, true);
    };

    reader.readAsText(file);
}

function eliminarFila(row) {
    csvData = csvData.filter(dataRow => dataRow !== row);
    const csvContent = convertirCSV(csvData);
    downloadCSV(csvContent, 'nuevo_archivo.csv');
    if (modoBorrar) {
        MostrarCSV(csvData, 'csvContentBorrar', false, true);
    } else {
        MostrarCSV(csvData, 'csvContent', false, true);
    }
}



// Descargar

function convertirCSV(data) {
    const headers = Object.keys(data[0]);
    const rows = data.map(row => {
        return headers.map(header => row[header]).join(',');
    });
    return [headers.join(','), ...rows].join('\n');
}

function downloadCSV(csvContent, filename) {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    if (navigator.msSaveBlob) { // IE 10+
        navigator.msSaveBlob(blob, filename);
    } else {
        const link = document.createElement("a");
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", filename);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }
}


