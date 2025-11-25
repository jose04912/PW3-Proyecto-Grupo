// ===================================
// VARIABLES GLOBALES Y CONSTANTES
// ===================================

const IMPUESTO_RATE = 0.08; // 8% de impuesto
let currentQuoteItems = []; // Items temporales de la cotización actual
let editingQuoteId = null; // ID de cotización en edición

// ===================================
// INICIALIZACIÓN DEL SISTEMA
// ===================================

document.addEventListener('DOMContentLoaded', function() {
    initializeDatabase();
    loadServicesShowcase();
    setTodayDate();
    
    // Event Listeners para formularios
    document.getElementById('clientForm').addEventListener('submit', saveClient);
    document.getElementById('serviceForm').addEventListener('submit', saveService);
    document.getElementById('quoteForm').addEventListener('submit', saveQuote);
    
    // Event Listener para cambio de servicio en cotización
    document.getElementById('itemService').addEventListener('change', updateItemPrice);
    
    console.log('Sistema inicializado correctamente');
});

// ===================================
// GESTIÓN DE BASE DE DATOS (localStorage)
// ===================================

function initializeDatabase() {
    // Verificar si ya existen datos
    if (!localStorage.getItem('clients')) {
        // Datos demo de clientes
        const demoClients = [
            { id: 1, name: 'ACME, S.A.', email: 'acme@ejemplo.com', phone: '6000-0000' },
            { id: 2, name: 'Juan Pérez', email: 'jperez@correo.com', phone: '6123-4567' }
        ];
        localStorage.setItem('clients', JSON.stringify(demoClients));
        localStorage.setItem('clientCounter', '3');
    }

    if (!localStorage.getItem('services')) {
        // Datos demo de servicios
        const demoServices = [
            { id: 1, name: 'Mantenimiento Preventivo PC', description: 'Limpieza física y actualización de software', price: 35.00 },
            { id: 2, name: 'Formateo e Instalación SO', description: 'Instalación completa de sistema operativo', price: 50.00 },
            { id: 3, name: 'Remoción de Malware', description: 'Eliminación de virus y software malicioso', price: 45.00 },
            { id: 4, name: 'Soporte Remoto (por hora)', description: 'Asistencia técnica remota', price: 20.00 }
        ];
        localStorage.setItem('services', JSON.stringify(demoServices));
        localStorage.setItem('serviceCounter', '5');
    }

    if (!localStorage.getItem('quotes')) {
        localStorage.setItem('quotes', JSON.stringify([]));
        localStorage.setItem('quoteCounter', '1');
    }
}

// Funciones de acceso a datos
function getClients() {
    return JSON.parse(localStorage.getItem('clients') || '[]');
}

function getServices() {
    return JSON.parse(localStorage.getItem('services') || '[]');
}

function getQuotes() {
    return JSON.parse(localStorage.getItem('quotes') || '[]');
}

function saveData(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

function getNextId(counterKey) {
    const counter = parseInt(localStorage.getItem(counterKey) || '1');
    localStorage.setItem(counterKey, (counter + 1).toString());
    return counter;
}

// ===================================
// NAVEGACIÓN ENTRE PÁGINAS
// ===================================

function showPage(pageId) {
    // Ocultar todas las páginas
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    // Mostrar la página seleccionada
    document.getElementById(pageId).classList.add('active');
    
    // Cargar datos según la página
    switch(pageId) {
        case 'clientsPage':
            loadClientsTable();
            break;
        case 'servicesPage':
            loadServicesTable();
            break;
        case 'quotesPage':
            loadQuotesTable();
            loadClientSelect('quoteClient');
            loadServiceSelect('itemService');
            break;
        case 'reportsPage':
            loadClientSelect('filterClient');
            loadReportsTable();
            break;
    }
}

// ===================================
// GESTIÓN DE CLIENTES
// ===================================

function saveClient(e) {
    e.preventDefault();
    
    const clientId = document.getElementById('clientId').value;
    const name = document.getElementById('clientName').value.trim();
    const email = document.getElementById('clientEmail').value.trim();
    const phone = document.getElementById('clientPhone').value.trim();
    
    // Validaciones
    if (!validateEmail(email)) {
        alert('Por favor ingrese un email válido');
        return;
    }
    
    if (!validatePhone(phone)) {
        alert('Por favor ingrese un teléfono válido (formato: 6000-0000)');
        return;
    }
    
    const clients = getClients();
    
    if (clientId) {
        // Modificar cliente existente
        const index = clients.findIndex(c => c.id == clientId);
        if (index !== -1) {
            clients[index] = { id: parseInt(clientId), name, email, phone };
        }
    } else {
        // Crear nuevo cliente
        const newClient = {
            id: getNextId('clientCounter'),
            name,
            email,
            phone
        };
        clients.push(newClient);
    }
    
    saveData('clients', clients);
    loadClientsTable();
    clearClientForm();
    alert('Cliente guardado exitosamente');
}

function loadClientsTable() {
    const clients = getClients();
    const tbody = document.getElementById('clientsTable');
    
    tbody.innerHTML = clients.map(client => `
        <tr>
            <td>${client.id}</td>
            <td>${client.name}</td>
            <td>${client.email}</td>
            <td>${client.phone}</td>
            <td>
                <button class="btn-edit" onclick="editClient(${client.id})">Editar</button>
                <button class="btn-delete" onclick="deleteClient(${client.id})">Eliminar</button>
            </td>
        </tr>
    `).join('');
}

function editClient(id) {
    const clients = getClients();
    const client = clients.find(c => c.id === id);
    
    if (client) {
        document.getElementById('clientId').value = client.id;
        document.getElementById('clientName').value = client.name;
        document.getElementById('clientEmail').value = client.email;
        document.getElementById('clientPhone').value = client.phone;
        window.scrollTo(0, 0);
    }
}

function deleteClient(id) {
    if (confirm('¿Está seguro de eliminar este cliente?')) {
        let clients = getClients();
        clients = clients.filter(c => c.id !== id);
        saveData('clients', clients);
        loadClientsTable();
        alert('Cliente eliminado');
    }
}

function clearClientForm() {
    document.getElementById('clientForm').reset();
    document.getElementById('clientId').value = '';
}

// ===================================
// GESTIÓN DE SERVICIOS
// ===================================

function saveService(e) {
    e.preventDefault();
    
    const serviceId = document.getElementById('serviceId').value;
    const name = document.getElementById('serviceName').value.trim();
    const description = document.getElementById('serviceDesc').value.trim();
    const price = parseFloat(document.getElementById('servicePrice').value);
    
    // Validación
    if (price < 0) {
        alert('El precio no puede ser negativo');
        return;
    }
    
    const services = getServices();
    
    if (serviceId) {
        // Modificar servicio existente
        const index = services.findIndex(s => s.id == serviceId);
        if (index !== -1) {
            services[index] = { id: parseInt(serviceId), name, description, price };
        }
    } else {
        // Crear nuevo servicio
        const newService = {
            id: getNextId('serviceCounter'),
            name,
            description,
            price
        };
        services.push(newService);
    }
    
    saveData('services', services);
    loadServicesTable();
    loadServicesShowcase();
    clearServiceForm();
    alert('Servicio guardado exitosamente');
}

function loadServicesTable() {
    const services = getServices();
    const tbody = document.getElementById('servicesTable');
    
    tbody.innerHTML = services.map(service => `
        <tr>
            <td>${service.id}</td>
            <td>${service.name}</td>
            <td>${service.description}</td>
            <td>$${service.price.toFixed(2)}</td>
            <td>
                <button class="btn-edit" onclick="editService(${service.id})">Editar</button>
                <button class="btn-delete" onclick="deleteService(${service.id})">Eliminar</button>
            </td>
        </tr>
    `).join('');
}

function loadServicesShowcase() {
    const services = getServices();
    const container = document.getElementById('servicesShowcase');
    
    container.innerHTML = services.map(service => `
        <div class="service-card">
            <h3>${service.name}</h3>
            <p>${service.description || 'Servicio profesional de soporte técnico'}</p>
            <div class="service-price">$${service.price.toFixed(2)}</div>
        </div>
    `).join('');
}

function editService(id) {
    const services = getServices();
    const service = services.find(s => s.id === id);
    
    if (service) {
        document.getElementById('serviceId').value = service.id;
        document.getElementById('serviceName').value = service.name;
        document.getElementById('serviceDesc').value = service.description;
        document.getElementById('servicePrice').value = service.price;
        window.scrollTo(0, 0);
    }
}

function deleteService(id) {
    if (confirm('¿Está seguro de eliminar este servicio?')) {
        let services = getServices();
        services = services.filter(s => s.id !== id);
        saveData('services', services);
        loadServicesTable();
        loadServicesShowcase();
        alert('Servicio eliminado');
    }
}

function clearServiceForm() {
    document.getElementById('serviceForm').reset();
    document.getElementById('serviceId').value = '';
}

// ===================================
// GESTIÓN DE COTIZACIONES
// ===================================

function loadClientSelect(selectId) {
    const clients = getClients();
    const select = document.getElementById(selectId);
    
    select.innerHTML = '<option value="">Seleccione un cliente</option>' +
        clients.map(client => `<option value="${client.id}">${client.name}</option>`).join('');
}

function loadServiceSelect(selectId) {
    const services = getServices();
    const select = document.getElementById(selectId);
    
    select.innerHTML = '<option value="">Seleccione un servicio</option>' +
        services.map(service => `<option value="${service.id}">${service.name} - $${service.price.toFixed(2)}</option>`).join('');
}

function updateItemPrice() {
    const serviceId = parseInt(document.getElementById('itemService').value);
    if (serviceId) {
        const services = getServices();
        const service = services.find(s => s.id === serviceId);
        if (service) {
            document.getElementById('itemPrice').value = service.price.toFixed(2);
        }
    } else {
        document.getElementById('itemPrice').value = '';
    }
}

function addQuoteItem() {
    const serviceId = parseInt(document.getElementById('itemService').value);
    const quantity = parseInt(document.getElementById('itemQuantity').value);
    const price = parseFloat(document.getElementById('itemPrice').value);
    
    // Validaciones
    if (!serviceId) {
        alert('Por favor seleccione un servicio');
        return;
    }
    
    if (quantity < 1) {
        alert('La cantidad debe ser mayor o igual a 1');
        return;
    }
    
    if (price < 0) {
        alert('El precio no puede ser negativo');
        return;
    }
    
    const services = getServices();
    const service = services.find(s => s.id === serviceId);
    
    const item = {
        serviceId,
        serviceName: service.name,
        quantity,
        price,
        subtotal: quantity * price
    };
    
    currentQuoteItems.push(item);
    updateQuoteItemsTable();
    
    // Limpiar campos
    document.getElementById('itemService').value = '';
    document.getElementById('itemQuantity').value = '1';
    document.getElementById('itemPrice').value = '';
}

function removeQuoteItem(index) {
    currentQuoteItems.splice(index, 1);
    updateQuoteItemsTable();
}

function updateQuoteItemsTable() {
    const tbody = document.getElementById('quoteItemsTable');
    
    tbody.innerHTML = currentQuoteItems.map((item, index) => `
        <tr>
            <td>${item.serviceName}</td>
            <td>${item.quantity}</td>
            <td>$${item.price.toFixed(2)}</td>
            <td>$${item.subtotal.toFixed(2)}</td>
            <td>
                <button class="btn-delete" onclick="removeQuoteItem(${index})">Eliminar</button>
            </td>
        </tr>
    `).join('');
    
    calculateQuoteTotals();
}

function calculateQuoteTotals() {
    const subtotal = currentQuoteItems.reduce((sum, item) => sum + item.subtotal, 0);
    const impuesto = subtotal * IMPUESTO_RATE;
    const total = subtotal + impuesto;
    
    document.getElementById('quoteSubtotal').textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById('quoteImpuesto').textContent = `$${impuesto.toFixed(2)}`;
    document.getElementById('quoteTotal').textContent = `$${total.toFixed(2)}`;
}

function saveQuote(e) {
    e.preventDefault();
    
    const clientId = parseInt(document.getElementById('quoteClient').value);
    const date = document.getElementById('quoteDate').value;
    
    // Validaciones
    if (!clientId) {
        alert('Por favor seleccione un cliente');
        return;
    }
    
    if (currentQuoteItems.length === 0) {
        alert('Por favor agregue al menos un item a la cotización');
        return;
    }
    
    const clients = getClients();
    const client = clients.find(c => c.id === clientId);
    
    const subtotal = currentQuoteItems.reduce((sum, item) => sum + item.subtotal, 0);
    const impuesto = subtotal * IMPUESTO_RATE;
    const total = subtotal + impuesto;
    
    const quotes = getQuotes();
    const quoteId = editingQuoteId || getNextId('quoteCounter');
    
    const newQuote = {
        id: quoteId,
        clientId,
        clientName: client.name,
        date,
        items: [...currentQuoteItems],
        subtotal,
        impuesto,
        total
    };
    
    if (editingQuoteId) {
        const index = quotes.findIndex(q => q.id === editingQuoteId);
        if (index !== -1) {
            quotes[index] = newQuote;
        }
        editingQuoteId = null;
    } else {
        quotes.push(newQuote);
    }
    
    saveData('quotes', quotes);
    loadQuotesTable();
    clearQuoteForm();
    alert('Cotización guardada exitosamente');
}

function loadQuotesTable() {
    const quotes = getQuotes();
    const tbody = document.getElementById('quotesTable');
    
    tbody.innerHTML = quotes.map(quote => `
        <tr>
            <td>COT-${String(quote.id).padStart(4, '0')}</td>
            <td>${formatDate(quote.date)}</td>
            <td>${quote.clientName}</td>
            <td>$${quote.subtotal.toFixed(2)}</td>
            <td>$${quote.impuesto.toFixed(2)}</td>
            <td>$${quote.total.toFixed(2)}</td>
            <td>
                <button class="btn-edit" onclick="editQuote(${quote.id})">Editar</button>
                <button class="btn-delete" onclick="deleteQuote(${quote.id})">Eliminar</button>
            </td>
        </tr>
    `).join('');
}

function editQuote(id) {
    const quotes = getQuotes();
    const quote = quotes.find(q => q.id === id);
    
    if (quote) {
        editingQuoteId = id;
        document.getElementById('quoteClient').value = quote.clientId;
        document.getElementById('quoteDate').value = quote.date;
        currentQuoteItems = [...quote.items];
        updateQuoteItemsTable();
        window.scrollTo(0, 0);
    }
}

function deleteQuote(id) {
    if (confirm('¿Está seguro de eliminar esta cotización?')) {
        let quotes = getQuotes();
        quotes = quotes.filter(q => q.id !== id);
        saveData('quotes', quotes);
        loadQuotesTable();
        alert('Cotización eliminada');
    }
}

function clearQuoteForm() {
    document.getElementById('quoteForm').reset();
    document.getElementById('quoteId').value = '';
    currentQuoteItems = [];
    editingQuoteId = null;
    updateQuoteItemsTable();
    setTodayDate();
}

// ===================================
// REPORTES Y FILTROS
// ===================================

function loadReportsTable(filteredQuotes = null) {
    const quotes = filteredQuotes || getQuotes();
    const tbody = document.getElementById('reportsTable');
    
    tbody.innerHTML = quotes.map(quote => `
        <tr>
            <td>${formatDate(quote.date)}</td>
            <td>COT-${String(quote.id).padStart(4, '0')}</td>
            <td>${quote.clientName}</td>
            <td>$${quote.subtotal.toFixed(2)}</td>
            <td>$${quote.impuesto.toFixed(2)}</td>
            <td>$${quote.total.toFixed(2)}</td>
        </tr>
    `).join('');
    
    // Calcular totales
    const totalSubtotal = quotes.reduce((sum, q) => sum + q.subtotal, 0);
    const totalImpuesto = quotes.reduce((sum, q) => sum + q.impuesto, 0);
    const totalTotal = quotes.reduce((sum, q) => sum + q.total, 0);
    
    document.getElementById('totalSubtotal').textContent = `$${totalSubtotal.toFixed(2)}`;
    document.getElementById('totalImpuesto').textContent = `$${totalImpuesto.toFixed(2)}`;
    document.getElementById('totalTotal').textContent = `$${totalTotal.toFixed(2)}`;
}

function applyFilters() {
    const clientId = document.getElementById('filterClient').value;
    const dateFrom = document.getElementById('filterDateFrom').value;
    const dateTo = document.getElementById('filterDateTo').value;
    
    let quotes = getQuotes();
    
    // Filtrar por cliente
    if (clientId) {
        quotes = quotes.filter(q => q.clientId == clientId);
    }
    
    // Filtrar por fecha desde
    if (dateFrom) {
        quotes = quotes.filter(q => q.date >= dateFrom);
    }
    
    // Filtrar por fecha hasta
    if (dateTo) {
        quotes = quotes.filter(q => q.date <= dateTo);
    }
    
    loadReportsTable(quotes);
}

function clearFilters() {
    document.getElementById('filterClient').value = '';
    document.getElementById('filterDateFrom').value = '';
    document.getElementById('filterDateTo').value = '';
    loadReportsTable();
}

// ===================================
// EXPORTAR A CSV
// ===================================

function exportToCSV() {
    const quotes = getQuotes();
    
    if (quotes.length === 0) {
        alert('No hay cotizaciones para exportar');
        return;
    }
    
    // Encabezados CSV
    let csv = 'Fecha,Nº Cotización,Cliente,Subtotal,Impuesto,Total\n';
    
    // Datos
    quotes.forEach(quote => {
        csv += `${quote.date},COT-${String(quote.id).padStart(4, '0')},${quote.clientName},${quote.subtotal.toFixed(2)},${quote.impuesto.toFixed(2)},${quote.total.toFixed(2)}\n`;
    });
    
    // Calcular totales
    const totalSubtotal = quotes.reduce((sum, q) => sum + q.subtotal, 0);
    const totalImpuesto = quotes.reduce((sum, q) => sum + q.impuesto, 0);
    const totalTotal = quotes.reduce((sum, q) => sum + q.total, 0);
    
    csv += `\nTOTALES:,,,${totalSubtotal.toFixed(2)},${totalImpuesto.toFixed(2)},${totalTotal.toFixed(2)}`;
    
    // Crear y descargar archivo
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `cotizaciones_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    alert('Archivo CSV exportado exitosamente');
}

// ===================================
// FUNCIONES DE UTILIDAD
// ===================================

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validatePhone(phone) {
    const re = /^\d{4}-\d{4}$/;
    return re.test(phone);
}

function formatDate(dateString) {
    const date = new Date(dateString + 'T00:00:00');
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

function setTodayDate() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('quoteDate').value = today;
}

// ===================================
// FUNCIÓN DE RESET (OPCIONAL)
// ===================================

function resetDatabase() {
    if (confirm('¿Está seguro de resetear toda la base de datos? Esta acción no se puede deshacer.')) {
        localStorage.clear();
        initializeDatabase();
        location.reload();
    }
}

console.log('Script cargado correctamente. Sistema listo para usar.');