/**
 * Washoe Admin - Logic
 * Handles state management, routing, and DOM rendering.
 */

// --- DATA INITIALIZATION ---
const initialProfile = {
    name: "Admin User",
    role: "Store Manager",
    avatar: "https://picsum.photos/100/100",
    businessName: "Washoe",
    tagline: "Premium Shoe Cleaning"
};

const initialOrders = [
    { id: '#WSH-092', customerName: 'Budi Santoso', serviceType: 'Deep Clean', items: '2 Pairs (Deep Clean)', total: 120000, date: 'Today, 10:30', status: 'Cleaning', paymentStatus: 'Paid', icon: 'check_circle', colorClass: 'text-status-process bg-status-process/20 border-status-process/20' },
    { id: '#WSH-091', customerName: 'Siti Aminah', serviceType: 'Fast Clean', items: '1 Pair (Fast Clean)', total: 45000, date: 'Yesterday', status: 'Waiting', paymentStatus: 'Unpaid', icon: 'pending', colorClass: 'text-status-pending bg-status-pending/20 border-status-pending/20' },
    { id: '#WSH-089', customerName: 'Kevin Wijaya', serviceType: 'Leather Care', items: '3 Pairs (Leather Care)', total: 250000, date: '2 days ago', status: 'Ready', paymentStatus: 'Paid', icon: 'check_circle', colorClass: 'text-emerald-500 bg-emerald-500/20 border-emerald-500/20' }
];

const customers = [
    { id: '1', name: 'Budi Santoso', location: 'Lowokwaru, Malang', ordersCount: 12, joinDate: 'Oct 2023', avatar: 'https://picsum.photos/101/101', phone: '+62 812-3456-7890' },
    { id: '2', name: 'Siti Rahmawati', location: 'Sukun, Malang', ordersCount: 4, joinDate: 'Jan 2024', avatar: '', phone: '+62 851-9988-7766' },
    { id: '3', name: 'Agus Pratama', location: 'Klojen, Malang', ordersCount: 15, joinDate: 'Aug 2023', avatar: 'https://picsum.photos/102/102', phone: '+62 813-5555-4444', isVip: true },
    { id: '4', name: 'Dewi Lestari', location: 'Blimbing, Malang', ordersCount: 2, joinDate: 'Feb 2024', avatar: '', phone: '+62 811-2233-4455' },
    { id: '5', name: 'Rian Hidayat', location: 'Lowokwaru, Malang', ordersCount: 8, joinDate: 'Nov 2023', avatar: 'https://picsum.photos/103/103', phone: '+62 899-8877-6655' },
];

const services = [
    { id: '1', name: 'Deep Clean', description: 'Standard deep cleaning', price: 60000, duration: '3-4 Days', icon: 'water_drop', isActive: true },
    { id: '2', name: 'Fast Clean', description: 'Quick upper body cleaning', price: 35000, duration: '24 Hours', icon: 'flash_on', isActive: true },
    { id: '3', name: 'Unyellowing', description: 'Sole restoration', price: 80000, duration: '5 Days', icon: 'wb_sunny', isActive: false },
    { id: '4', name: 'Recolor', description: 'Full shoe recoloring', price: 150000, duration: '7 Days', icon: 'auto_fix_high', isActive: true },
];

// --- GLOBAL STATE ---
const appState = {
    currentPage: 'dashboard',
    userProfile: { ...initialProfile },
    orders: [...initialOrders],
    activeOverlay: 'none',
    selectedOrder: null,
    searchTerm: '',
    orderFilter: 'All'
};

// --- ACTIONS (Logika Bisnis) ---

function navigate(page) {
    appState.currentPage = page;
    render();
    window.scrollTo(0,0);
}

function setOverlay(type, order = null) {
    appState.activeOverlay = type;
    appState.selectedOrder = order;
    renderOverlay();
}

function closeOverlay() {
    // Menangani animasi tutup sebelum menghapus elemen
    const modal = document.querySelector('.modal-content');
    const sidebar = document.querySelector('.sidebar-content');
    const bg = document.querySelector('.modal-bg');
    
    if(modal) {
        modal.classList.remove('modal-enter-active');
        modal.classList.add('modal-enter');
    }
    if(sidebar) {
        sidebar.style.transform = 'translateX(-100%)';
    }
    if(bg) {
        bg.classList.remove('fade-enter-active');
        bg.classList.add('fade-enter');
    }
    
    // Tunggu animasi selesai
    setTimeout(() => {
        appState.activeOverlay = 'none';
        appState.selectedOrder = null;
        renderOverlay();
    }, 250);
}

function addOrder(e) {
    e.preventDefault();
    const form = e.target;
    const newOrder = {
        id: `#WSH-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
        customerName: form.customerName.value,
        serviceType: form.serviceType.value,
        items: form.items.value,
        total: Number(form.total.value),
        date: 'Just Now',
        status: 'Waiting',
        paymentStatus: 'Unpaid',
        icon: 'pending',
        colorClass: 'text-status-pending bg-status-pending/20 border-status-pending/20'
    };
    appState.orders.unshift(newOrder);
    closeOverlay();
    if(appState.currentPage === 'dashboard' || appState.currentPage === 'orders') {
        render(); // Re-render untuk menampilkan data baru
    }
}

function updateProfile(e) {
    e.preventDefault();
    const form = e.target;
    appState.userProfile = {
        ...appState.userProfile,
        name: form.fullName.value,
        role: form.role.value,
        businessName: form.businessName.value
    };
    closeOverlay();
    render(); 
}

function updateOrderStatus(newStatus) {
    if(!appState.selectedOrder) return;
    
    appState.orders = appState.orders.map(o => {
        if(o.id === appState.selectedOrder.id) {
            let colorClass = o.colorClass;
            let icon = o.icon;
            switch (newStatus) {
                case 'Waiting': colorClass = 'text-status-pending bg-status-pending/20 border-status-pending/20'; icon = 'pending'; break;
                case 'Cleaning':
                case 'Treatment':
                case 'Inspection': colorClass = 'text-status-process bg-status-process/20 border-status-process/20'; icon = 'water_drop'; break;
                case 'Ready': colorClass = 'text-emerald-500 bg-emerald-500/20 border-emerald-500/20'; icon = 'check_circle'; break;
                case 'Delivered': colorClass = 'text-slate-500 bg-slate-500/20 border-slate-500/20'; icon = 'local_shipping'; break;
            }
            return { ...o, status: newStatus, colorClass, icon };
        }
        return o;
    });
    closeOverlay();
    render();
}

function setFilter(filter) {
    appState.orderFilter = filter;
    render();
}

// --- HTML GENERATORS (Template Functions) ---

function getHeaderHTML(title, subtitle, showAdd = false, addAction = '', addLabel = 'Add') {
    return `
    <header class="flex items-center justify-between mb-6">
        <div class="flex items-center gap-4">
             <button onclick="setOverlay('sidebar')" class="p-2.5 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-primary/40 text-slate-600 dark:text-slate-300 transition-colors md:hidden">
                <span class="material-icons text-2xl">menu</span>
            </button>
            <div>
                <h1 class="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">${title}</h1>
                <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">${subtitle}</p>
            </div>
        </div>
        ${showAdd ? `
        <button onclick="${addAction}" class="bg-primary hover:bg-primary-light text-white p-3 rounded-xl shadow-lg shadow-primary/40 transition-all active:scale-95 flex items-center justify-center gap-2">
            <span class="material-icons">add</span>
            <span class="hidden sm:inline font-bold text-sm">${addLabel}</span>
        </button>
        ` : ''}
    </header>`;
}

function renderDashboard() {
    const { userProfile, orders } = appState;
    const revenue = orders.reduce((acc, curr) => acc + curr.total, 0);
    const activeCount = orders.filter(o => !['Delivered', 'Ready'].includes(o.status)).length;
    
    // Helper stats
    const getCount = (statuses) => orders.filter(o => statuses.includes(o.status)).length;
    
    const stats = [
        { label: 'Waiting', count: getCount(['Waiting']), icon: 'hourglass_empty', color: 'text-amber-500', bg: 'bg-amber-500/20', border: 'border-amber-200 dark:border-amber-500/20' },
        { label: 'Cleaning', count: getCount(['Cleaning', 'Treatment', 'Inspection']), icon: 'water_drop', color: 'text-blue-500', bg: 'bg-blue-500/20', border: 'border-blue-200 dark:border-blue-500/20' },
        { label: 'Ready', count: getCount(['Ready']), icon: 'check_circle', color: 'text-green-500', bg: 'bg-green-500/20', border: 'border-green-200 dark:border-green-500/20' },
        { label: 'Delivered', count: getCount(['Delivered']), icon: 'local_shipping', color: 'text-slate-500', bg: 'bg-slate-500/20', border: 'border-slate-200 dark:border-slate-500/20' },
    ];

    return `
    <div class="px-4 pt-6 pb-24 space-y-8 page-fade-in">
        <!-- Dashboard Specific Header -->
        <header class="flex items-center justify-between mb-2">
            <div class="flex items-center gap-4">
                <button onclick="setOverlay('sidebar')" class="p-2.5 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-primary/40 text-slate-600 dark:text-slate-300 transition-colors">
                    <span class="material-icons text-2xl">menu</span>
                </button>
                <div class="flex flex-col">
                    <h1 class="text-2xl font-bold tracking-tight text-primary dark:text-white">${userProfile.businessName}</h1>
                    <span class="text-sm text-slate-500 dark:text-slate-400 font-medium">Admin Dashboard</span>
                </div>
            </div>
            <div class="flex items-center gap-3">
                <button onclick="setOverlay('search')" class="p-2.5 rounded-full hover:bg-slate-100 dark:hover:bg-primary/40 text-slate-600 dark:text-slate-300 transition-colors hidden sm:block">
                    <span class="material-icons text-2xl">search</span>
                </button>
                <button onclick="setOverlay('edit-profile')" class="relative group p-1">
                    <img alt="Profile" class="h-10 w-10 rounded-full object-cover border-2 border-white dark:border-primary/50 ring-2 ring-accent/20 hover:scale-105 transition-transform" src="${userProfile.avatar}" />
                    <span class="absolute bottom-1 right-1 block h-3 w-3 rounded-full bg-green-500 ring-2 ring-white dark:ring-background-dark"></span>
                </button>
            </div>
        </header>

        <!-- Stats Overview Cards -->
        <section>
            <h2 class="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold mb-4 px-1">Overview</h2>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <!-- Revenue Card -->
                <div class="p-5 rounded-2xl bg-gradient-to-br from-primary to-primary-light border border-primary/40 text-white shadow-lg shadow-primary/20 relative overflow-hidden group hover:scale-[1.02] transition-transform">
                    <div class="absolute right-0 top-0 p-3 opacity-10 group-hover:scale-110 transition-transform"><span class="material-icons text-8xl">payments</span></div>
                    <div class="flex items-start justify-between mb-6 relative z-10">
                        <div class="p-2.5 bg-white/10 rounded-xl backdrop-blur-sm"><span class="material-icons text-accent text-2xl">payments</span></div>
                        <span class="text-xs font-bold text-green-300 flex items-center bg-green-900/40 px-2 py-1 rounded-lg backdrop-blur-md"><span class="material-icons text-sm mr-1">trending_up</span> 12%</span>
                    </div>
                    <div class="relative z-10">
                        <p class="text-sm text-slate-300 font-medium mb-1">Total Revenue</p>
                        <h3 class="text-3xl font-bold tracking-tight">Rp ${(revenue/1000000).toFixed(1)}M</h3>
                    </div>
                </div>
                <!-- Orders Card -->
                <div class="p-5 rounded-2xl bg-white dark:bg-background-card border border-gray-200 dark:border-primary/30 shadow-sm hover:border-accent/50 transition-colors">
                    <div class="flex items-start justify-between mb-6">
                        <div class="p-2.5 bg-accent/10 rounded-xl"><span class="material-icons text-accent text-2xl">shopping_bag</span></div>
                    </div>
                    <div>
                        <p class="text-sm text-slate-500 dark:text-slate-400 font-medium mb-1">Total Orders</p>
                        <h3 class="text-3xl font-bold text-slate-800 dark:text-white">${orders.length}</h3>
                    </div>
                </div>
                <!-- Active Card -->
                 <div class="p-5 rounded-2xl bg-white dark:bg-background-card border border-gray-200 dark:border-primary/30 shadow-sm hover:border-purple-500/50 transition-colors">
                    <div class="flex items-start justify-between mb-6">
                        <div class="p-2.5 bg-purple-500/10 rounded-xl"><span class="material-icons text-purple-500 text-2xl">bolt</span></div>
                    </div>
                    <div>
                        <p class="text-sm text-slate-500 dark:text-slate-400 font-medium mb-1">Active Now</p>
                        <h3 class="text-3xl font-bold text-slate-800 dark:text-white">${activeCount}</h3>
                    </div>
                </div>
            </div>
        </section>

        <!-- Current Activity Grid -->
        <section>
            <div class="flex items-center justify-between mb-4 px-1">
                <h2 class="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold">Current Activity</h2>
            </div>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                ${stats.map(s => `
                <div class="p-4 rounded-xl bg-white dark:bg-background-card border ${s.border} flex items-center justify-between shadow-sm hover:shadow-md transition-all">
                    <div class="flex flex-col">
                        <span class="text-sm text-slate-500 dark:text-slate-400 font-medium">${s.label}</span>
                        <span class="text-2xl font-bold text-slate-800 dark:text-white mt-1">${s.count}</span>
                    </div>
                    <div class="h-10 w-10 rounded-full ${s.bg} flex items-center justify-center">
                        <span class="material-icons ${s.color} text-xl">${s.icon}</span>
                    </div>
                </div>
                `).join('')}
            </div>
        </section>

        <!-- Recent Orders -->
        <section>
            <div class="flex items-center justify-between mb-4 px-1">
                <h2 class="text-lg font-bold text-slate-800 dark:text-white">Recent Orders</h2>
                <button onclick="navigate('orders')" class="text-sm text-accent font-semibold hover:text-accent/80 transition-colors bg-accent/10 px-3 py-1 rounded-lg">View All</button>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                ${orders.slice(0, 6).map(o => `
                <div onclick="setOverlay('update-status', appState.orders.find(or => or.id === '${o.id}'))" class="bg-white dark:bg-background-card rounded-xl p-4 shadow-sm border border-gray-200 dark:border-primary/30 flex items-center justify-between cursor-pointer active:scale-95 transition-transform hover:border-accent/50">
                    <div class="flex items-center gap-4">
                        <div class="h-14 w-14 rounded-xl ${o.colorClass} flex items-center justify-center shrink-0">
                            <span class="material-icons text-2xl">${o.icon}</span>
                        </div>
                        <div>
                            <div class="flex items-center gap-2 mb-1">
                                <h4 class="font-bold text-slate-800 dark:text-white text-sm">${o.customerName}</h4>
                            </div>
                            <div class="flex gap-2 mb-1">
                                <span class="text-[10px] px-2 py-0.5 rounded-md border font-bold uppercase tracking-wide ${o.colorClass}">${o.status}</span>
                            </div>
                            <p class="text-xs text-slate-500 dark:text-slate-400">${o.serviceType} • ${o.id}</p>
                        </div>
                    </div>
                    <div class="flex flex-col items-end gap-1.5 self-center">
                        <span class="text-sm font-bold text-slate-700 dark:text-slate-200">Rp ${(o.total / 1000).toFixed(0)}k</span>
                        <span class="text-[10px] text-slate-400">${o.date}</span>
                    </div>
                </div>
                `).join('')}
            </div>
        </section>

        <!-- Floating Action Button -->
        <div class="fixed bottom-24 right-6 z-40 sm:absolute sm:bottom-6 sm:right-6">
            <button onclick="setOverlay('new-order')" class="h-16 w-16 rounded-full bg-accent hover:bg-blue-600 text-white shadow-xl shadow-accent/30 flex items-center justify-center transition-all transform hover:scale-105 active:scale-95 group">
                <span class="material-icons text-3xl group-hover:rotate-90 transition-transform">add</span>
            </button>
        </div>
    </div>
    `;
}

function renderOrders() {
    let list = appState.orders.filter(o => 
        o.customerName.toLowerCase().includes(appState.searchTerm.toLowerCase()) || 
        o.id.toLowerCase().includes(appState.searchTerm.toLowerCase())
    );

    if (appState.orderFilter === 'Process') {
        list = list.filter(o => ['Cleaning', 'Waiting', 'Inspection', 'Treatment'].includes(o.status));
    } else if (appState.orderFilter === 'Ready') {
        list = list.filter(o => ['Ready', 'Delivered'].includes(o.status));
    }

    const totalRevenue = list.reduce((sum, order) => sum + order.total, 0);

    return `
    <div class="pb-24 pt-4 px-4 page-fade-in">
        ${getHeaderHTML("Orders", "Manage customer orders", true, "setOverlay('new-order')", "New Order")}
        
        <!-- Search and Filters -->
        <div class="flex flex-col md:flex-row gap-4 mb-6">
            <div class="relative flex-1">
                <span class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400"><span class="material-icons text-xl">search</span></span>
                <input type="text" oninput="appState.searchTerm = this.value; render();" value="${appState.searchTerm}"
                class="w-full bg-white dark:bg-primary/10 border border-slate-200 dark:border-primary/30 text-slate-900 dark:text-white text-sm rounded-xl focus:ring-accent focus:border-accent block pl-10 p-3.5 placeholder-slate-400 dark:placeholder-slate-500 transition-colors shadow-sm"
                placeholder="Search orders..." />
            </div>
            <div class="flex gap-2 overflow-x-auto hide-scrollbar pb-1 md:pb-0">
                ${['All', 'Process', 'Ready'].map(f => `
                    <button onclick="setFilter('${f}')" class="whitespace-nowrap px-5 py-2 rounded-xl text-sm font-semibold border transition-all ${appState.orderFilter === f ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' : 'bg-white dark:bg-primary/5 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-primary/20 hover:bg-slate-50 dark:hover:bg-primary/10'}">
                        ${f === 'All' ? 'All Orders' : f === 'Process' ? 'In Process' : 'Ready / Delivered'}
                    </button>
                `).join('')}
            </div>
        </div>

        <!-- Mini Stats -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
             <div class="bg-white dark:bg-primary/10 p-4 rounded-xl border border-slate-200 dark:border-primary/20 flex flex-col justify-between h-24">
                <span class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Count</span>
                <span class="text-2xl font-bold text-primary dark:text-white">${list.length}</span>
            </div>
             <div class="bg-white dark:bg-primary/10 p-4 rounded-xl border border-slate-200 dark:border-primary/20 flex flex-col justify-between h-24">
                <span class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Revenue</span>
                <span class="text-2xl font-bold text-primary dark:text-white">Rp ${(totalRevenue/1000).toFixed(0)}k</span>
            </div>
        </div>

        <!-- Order List -->
        ${list.length === 0 ? `
         <div class="flex flex-col items-center justify-center py-20 text-slate-400 bg-slate-50 dark:bg-primary/5 rounded-2xl border-2 border-dashed border-slate-200 dark:border-primary/20">
            <span class="material-icons text-6xl mb-4 opacity-20">search_off</span>
            <p class="text-base font-medium">No orders found.</p>
         </div>
        ` : `
        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            ${list.map(o => `
             <article class="bg-white dark:bg-primary/10 border border-slate-200 dark:border-primary/30 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col group">
                <div class="flex justify-between items-start mb-4">
                    <div>
                        <div class="flex items-center gap-2">
                            <span class="text-sm font-bold text-primary dark:text-white">${o.id}</span>
                            <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${o.colorClass}">${o.serviceType}</span>
                        </div>
                        <h3 class="text-lg font-bold text-slate-800 dark:text-slate-100 mt-1">${o.customerName}</h3>
                    </div>
                    <div class="text-right">
                        <span class="block text-xs font-medium text-slate-500 dark:text-slate-400">${o.date}</span>
                        <span class="text-xs font-bold mt-1 inline-block ${['Ready','Delivered'].includes(o.status)?'text-emerald-500':'text-blue-500'}">${o.status}</span>
                    </div>
                </div>
                <div class="bg-slate-50 dark:bg-background-dark/50 rounded-xl p-4 mb-4 text-sm space-y-2 flex-1">
                     <div class="flex justify-between items-start">
                        <span class="text-slate-500 dark:text-slate-400">Items</span>
                        <span class="font-medium dark:text-slate-200 text-right max-w-[60%]">${o.items}</span>
                    </div>
                    <div class="flex justify-between items-center pt-2 border-t border-slate-200 dark:border-primary/20">
                        <span class="text-slate-500 dark:text-slate-400">Total</span>
                        <span class="font-bold text-primary dark:text-white text-lg">Rp ${o.total.toLocaleString()}</span>
                    </div>
                </div>
                <div class="flex items-center justify-between mt-auto pt-2">
                     <span class="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide ${o.paymentStatus === 'Paid' ? 'bg-status-paid/10 text-status-paid' : 'bg-status-unpaid/10 text-status-unpaid'}">
                        <span class="material-icons text-sm">${o.paymentStatus === 'Paid' ? 'check_circle' : 'pending'}</span> ${o.paymentStatus}
                    </span>
                     <button onclick="setOverlay('update-status', appState.orders.find(or => or.id === '${o.id}'))" class="bg-primary hover:bg-primary-light text-white text-xs px-4 py-2 rounded-lg font-bold shadow-md transition-colors">Update</button>
                </div>
             </article>
            `).join('')}
        </div>
        `}
    </div>`;
}

function renderCustomers() {
     return `
    <div class="pb-24 pt-6 px-4 h-full flex flex-col page-fade-in">
        ${getHeaderHTML("Customers", "Client Directory", true, "alert('Feature coming soon')", "Add Client")}
        
         <!-- Search -->
        <div class="sticky top-0 z-20 pb-6 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-sm transition-all space-y-4">
            <div class="relative">
                <span class="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-slate-400"><span class="material-icons text-xl">search</span></span>
                <input type="text" class="w-full py-3.5 pl-12 pr-4 bg-white dark:bg-primary/10 border border-slate-200 dark:border-primary/20 text-slate-900 dark:text-white placeholder-slate-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-base shadow-sm" placeholder="Search by name..." />
            </div>
            <div class="flex gap-3 overflow-x-auto pb-1 hide-scrollbar">
                <button class="px-4 py-2 bg-blue-500 text-white text-sm font-semibold rounded-lg whitespace-nowrap shadow-md">All Customers</button>
                <button class="px-4 py-2 bg-white dark:bg-primary/5 border border-slate-200 dark:border-primary/20 text-slate-600 dark:text-slate-300 text-sm font-semibold rounded-lg whitespace-nowrap">Top Spenders</button>
            </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            ${customers.map(c => `
            <div class="group relative bg-white dark:bg-primary/5 rounded-2xl p-5 border border-slate-200 dark:border-primary/20 hover:border-blue-500/50 transition-all shadow-sm hover:shadow-md">
                <div class="flex items-start justify-between mb-4">
                    <div class="flex items-center gap-4">
                        ${c.avatar 
                          ? `<img src="${c.avatar}" class="w-14 h-14 rounded-full object-cover border-2 border-white dark:border-primary-light" />`
                          : `<div class="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center border-2 border-white text-white font-bold text-xl">${c.name.substring(0,2).toUpperCase()}</div>`
                        }
                        <div>
                            <h3 class="text-slate-900 dark:text-white font-bold text-lg leading-tight group-hover:text-blue-500 transition-colors">${c.name}</h3>
                            <div class="flex items-center gap-1 mt-1 text-slate-500 dark:text-slate-400 text-sm font-medium">
                                <span class="material-icons text-[14px] text-blue-500">location_on</span>
                                <span>${c.location}</span>
                            </div>
                        </div>
                    </div>
                     <div class="flex flex-col items-end">
                        <span class="text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${c.isVip ? 'bg-amber-100 text-amber-600' : 'bg-blue-50 text-blue-600'}">
                        ${c.isVip ? '<span class="material-icons text-[10px]">star</span> VIP' : c.ordersCount + ' ORDERS'}
                        </span>
                    </div>
                </div>
                <div class="mt-4 pt-4 border-t border-slate-100 dark:border-primary/10 flex items-center justify-between">
                    <div class="flex flex-col">
                        <span class="text-[10px] uppercase text-slate-400 font-bold tracking-wider">Phone</span>
                        <a href="#" class="text-slate-700 dark:text-slate-300 text-sm font-semibold hover:text-blue-500">${c.phone}</a>
                    </div>
                     <div class="flex flex-col items-end">
                        <span class="text-[10px] uppercase text-slate-400 font-bold tracking-wider">Joined</span>
                        <span class="text-slate-700 dark:text-slate-300 text-sm font-semibold">${c.joinDate}</span>
                    </div>
                </div>
            </div>
            `).join('')}
        </div>
    </div>`;
}

function renderServices() {
     return `
    <div class="pb-24 pt-6 px-4 page-fade-in">
        ${getHeaderHTML("Services", "Manage catalog", true, "alert('Coming soon')", "Add Service")}
        
        <!-- Search -->
        <div class="relative group max-w-lg mb-6">
            <span class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400"><span class="material-icons">search</span></span>
            <input type="text" class="block w-full pl-10 pr-3 py-3.5 rounded-xl border border-slate-200 dark:border-primary/30 bg-white dark:bg-primary/10 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary shadow-sm" placeholder="Search services..." />
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            ${services.map(s => `
            <div class="bg-white dark:bg-primary/5 rounded-2xl p-6 border border-slate-100 dark:border-primary/30 shadow-sm relative overflow-hidden transition-all group hover:shadow-md hover:border-accent/50">
                <div class="flex justify-between items-start mb-6 relative z-10">
                    <div class="flex gap-4">
                        <div class="w-14 h-14 rounded-xl ${s.isActive ? 'bg-primary/10 text-primary dark:text-white' : 'bg-slate-100 text-slate-400'} flex items-center justify-center">
                            <span class="material-icons text-2xl">${s.icon}</span>
                        </div>
                        <div>
                            <h3 class="font-bold text-xl text-slate-900 dark:text-white">${s.name}</h3>
                            <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">${s.description}</p>
                        </div>
                    </div>
                    <div class="relative inline-flex h-7 w-12 items-center rounded-full ${s.isActive ? 'bg-accent' : 'bg-slate-300 dark:bg-slate-700'}">
                        <span class="inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${s.isActive ? 'translate-x-6' : 'translate-x-1'}"></span>
                    </div>
                </div>
                <div class="grid grid-cols-2 gap-4 mb-6 relative z-10 p-4 bg-slate-50 dark:bg-black/20 rounded-xl">
                    <div>
                        <span class="text-xs text-slate-500 uppercase font-bold tracking-wider block mb-1">Price</span>
                        <span class="text-lg font-bold tracking-tight text-slate-900 dark:text-white">Rp ${s.price.toLocaleString()}</span>
                    </div>
                    <div>
                        <span class="text-xs text-slate-500 uppercase font-bold tracking-wider block mb-1">Duration</span>
                        <span class="text-lg font-semibold flex items-center gap-1 text-slate-900 dark:text-white"><span class="material-icons text-sm text-slate-400">schedule</span> ${s.duration}</span>
                    </div>
                </div>
                 <div class="border-t border-slate-100 dark:border-primary/20 pt-4 flex justify-end gap-3 relative z-10">
                    <button class="px-4 py-2 rounded-lg text-slate-500 hover:text-primary dark:text-slate-400 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-primary/20 transition-colors text-sm font-semibold flex items-center gap-2">
                        <span class="material-icons text-lg">edit</span> Edit
                    </button>
                    <button class="px-4 py-2 rounded-lg text-slate-500 hover:text-red-500 dark:text-slate-400 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors text-sm font-semibold flex items-center gap-2">
                        <span class="material-icons text-lg">delete</span> Delete
                    </button>
                </div>
            </div>
            `).join('')}
        </div>
    </div>`;
}

function renderSettings() {
     return `
     <div class="pb-24 page-fade-in">
        <header class="bg-white/95 dark:bg-surface-darker/95 backdrop-blur-md px-4 py-3 sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 dark:border-primary/20">
            <div class="flex items-center gap-2">
                <button onclick="setOverlay('sidebar')" class="p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/5 md:hidden"><span class="material-icons text-slate-500">menu</span></button>
                <h1 class="text-lg font-semibold text-slate-800 dark:text-white tracking-wide">System Settings</h1>
            </div>
            <button class="text-sm font-medium text-blue-500 hover:text-blue-600 px-2 py-1">Save</button>
        </header>
        <div class="p-5 space-y-6 max-w-2xl mx-auto">
            <div class="flex flex-col items-center justify-center py-4 mb-2">
                <div onclick="setOverlay('edit-profile')" class="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-primary-lighter shadow-lg flex items-center justify-center mb-3 ring-4 ring-white dark:ring-surface-darker relative group cursor-pointer hover:scale-105 transition-transform">
                    <img src="${appState.userProfile.avatar}" class="w-full h-full rounded-full object-cover" />
                    <div class="absolute inset-0 bg-black/30 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><span class="material-icons text-white">edit</span></div>
                </div>
                <h2 class="text-slate-900 dark:text-white font-bold text-lg">${appState.userProfile.businessName}</h2>
                <p class="text-slate-500 text-xs uppercase tracking-widest font-medium mt-1">Version 2.4.0</p>
            </div>
            
            <section class="space-y-3">
                <div class="flex items-center gap-2 px-1">
                    <span class="material-icons text-blue-500 dark:text-blue-400 text-sm">visibility</span>
                    <h3 class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Public View</h3>
                </div>
                <button onclick="navigate('tracking')" class="w-full bg-white dark:bg-surface rounded-xl border border-gray-200 dark:border-primary/20 p-4 flex items-center justify-between group hover:border-blue-500 transition-colors">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-500"><span class="material-icons">public</span></div>
                        <div class="text-left">
                            <h4 class="text-sm font-medium text-slate-900 dark:text-white">Open Tracking Page</h4>
                            <p class="text-xs text-slate-500">View what customers see</p>
                        </div>
                    </div>
                    <span class="material-icons text-slate-400 group-hover:text-blue-500">chevron_right</span>
                </button>
            </section>
        </div>
     </div>`;
}

function renderTracking() {
    return `
    <div class="bg-background-light dark:bg-background-dark min-h-screen flex flex-col relative pb-8 page-fade-in">
         <header class="w-full px-6 py-6 flex items-center justify-between z-10">
            <div class="flex items-center gap-2">
                <button onclick="navigate('dashboard')" class="p-1 mr-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-400">
                    <span class="material-icons">arrow_back</span>
                </button>
                <div class="w-8 h-8 bg-gradient-to-br from-primary to-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-900/20">
                    <span class="text-white font-bold text-lg">W</span>
                </div>
                <h1 class="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Washoe</h1>
            </div>
        </header>

        <main class="flex-1 px-6 max-w-3xl mx-auto w-full">
            <section class="mb-8">
                <div class="bg-white dark:bg-background-card p-6 rounded-2xl shadow-xl shadow-black/5 border border-slate-200 dark:border-slate-800/50">
                    <h2 class="text-2xl font-bold mb-2 text-slate-900 dark:text-white">Track Your Shoes</h2>
                    <p class="text-slate-500 dark:text-slate-400 text-sm mb-6">Enter your order ID to see the cleaning status.</p>
                    <div class="relative group mb-4">
                        <span class="material-icons absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                        <input type="text" value="W-8294" class="w-full bg-slate-100 dark:bg-background-dark border-transparent focus:border-blue-500 rounded-xl py-4 pl-12 pr-4 text-slate-900 dark:text-white font-medium transition-all" />
                    </div>
                    <button class="w-full bg-primary hover:bg-primary-light text-white font-semibold py-4 rounded-xl shadow-lg flex items-center justify-center gap-2">Check Status <span class="material-icons text-sm">arrow_forward</span></button>
                </div>
            </section>

             <section class="relative pl-2 mb-10">
                <h3 class="font-semibold text-slate-900 dark:text-white mb-6">Tracking History</h3>
                <div class="relative pl-6 border-l-2 border-slate-200 dark:border-slate-800 space-y-10">
                     <div class="relative group">
                        <div class="absolute -left-[31px] bg-primary h-4 w-4 rounded-full border-4 border-white dark:border-background-dark shadow-sm z-10"></div>
                        <div class="flex flex-col">
                            <span class="text-xs font-medium text-slate-500 mb-0.5">Oct 24, 09:30 AM</span>
                            <h4 class="text-base font-bold text-slate-900 dark:text-white">Order Received</h4>
                        </div>
                    </div>
                    <div class="relative">
                        <div class="absolute -left-[33px] top-0.5 h-5 w-5 flex items-center justify-center z-10">
                            <div class="pulse-ring"></div>
                            <div class="h-3 w-3 bg-blue-500 rounded-full"></div>
                        </div>
                        <div class="flex flex-col">
                            <span class="text-xs font-semibold text-blue-500 mb-0.5">Current Stage</span>
                            <h4 class="text-base font-bold text-blue-500">Deep Cleaning</h4>
                            <p class="text-sm text-slate-500 mt-1">Technicians are removing stains and dirt.</p>
                        </div>
                    </div>
                     <div class="relative opacity-50">
                        <div class="absolute -left-[31px] bg-slate-300 dark:bg-slate-700 h-4 w-4 rounded-full border-4 border-white dark:border-background-dark z-10"></div>
                        <div class="flex flex-col">
                            <h4 class="text-base font-medium text-slate-900 dark:text-white">Ready for Delivery</h4>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    </div>
    `;
}

// --- OVERLAY RENDERER (Modals, Sidebar) ---

function renderOverlay() {
    const container = document.getElementById('overlay-container');
    const { activeOverlay, selectedOrder, userProfile } = appState;

    if (activeOverlay === 'none') {
        container.innerHTML = '';
        return;
    }

    let content = '';
    
    if (activeOverlay === 'new-order') {
        content = `
        <div class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            <div class="absolute inset-0 bg-black/60 backdrop-blur-sm modal-bg fade-enter-active" onclick="closeOverlay()"></div>
            <div class="bg-white dark:bg-background-card w-full max-w-lg rounded-t-2xl sm:rounded-2xl p-6 relative z-10 shadow-2xl modal-content modal-enter-active">
                <div class="w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mb-6 sm:hidden"></div>
                <div class="flex justify-between items-center mb-6">
                    <h2 class="text-2xl font-bold text-slate-900 dark:text-white">New Order</h2>
                    <button onclick="closeOverlay()" class="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-primary/20"><span class="material-icons">close</span></button>
                </div>
                <form onsubmit="addOrder(event)" class="space-y-5">
                    <div>
                        <label class="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-1.5">Customer Name</label>
                        <input name="customerName" required class="w-full rounded-xl border-slate-200 bg-slate-50 dark:bg-primary/10 dark:text-white p-3.5 focus:ring-accent" placeholder="e.g. John Doe" />
                    </div>
                    <div class="grid grid-cols-2 gap-5">
                        <div>
                            <label class="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-1.5">Service</label>
                            <select name="serviceType" class="w-full rounded-xl border-slate-200 bg-slate-50 dark:bg-primary/10 dark:text-white p-3.5 focus:ring-accent">
                                <option>Deep Clean</option><option>Fast Clean</option><option>Repaint</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-1.5">Total (Rp)</label>
                            <input name="total" type="number" required class="w-full rounded-xl border-slate-200 bg-slate-50 dark:bg-primary/10 dark:text-white p-3.5 focus:ring-accent" />
                        </div>
                    </div>
                    <div>
                        <label class="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-1.5">Items</label>
                        <textarea name="items" rows="2" class="w-full rounded-xl border-slate-200 bg-slate-50 dark:bg-primary/10 dark:text-white p-3.5 focus:ring-accent"></textarea>
                    </div>
                    <button type="submit" class="w-full bg-primary hover:bg-primary-light text-white py-4 rounded-xl font-bold shadow-xl mt-2 active:scale-[0.98] transition-transform">Create Order</button>
                </form>
            </div>
        </div>`;
    } else if (activeOverlay === 'update-status') {
        const statuses = ['Waiting', 'Inspection', 'Cleaning', 'Treatment', 'Ready', 'Delivered'];
        content = `
        <div class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            <div class="absolute inset-0 bg-black/60 backdrop-blur-sm modal-bg fade-enter-active" onclick="closeOverlay()"></div>
            <div class="bg-white dark:bg-background-card w-full max-w-lg rounded-t-2xl sm:rounded-2xl p-6 relative z-10 shadow-2xl modal-content modal-enter-active">
                    <div class="w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mb-6 sm:hidden"></div>
                    <div class="flex justify-between items-center mb-6">
                        <div>
                            <h2 class="text-2xl font-bold text-slate-900 dark:text-white">Update Status</h2>
                            <p class="text-sm text-slate-500">Order: ${selectedOrder.id}</p>
                        </div>
                        <button onclick="closeOverlay()" class="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-primary/20"><span class="material-icons">close</span></button>
                    </div>
                    <div class="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
                    ${statuses.map(s => `
                        <button onclick="updateOrderStatus('${s}')" class="p-4 rounded-xl border text-sm font-medium transition-all ${selectedOrder.status === s ? 'border-accent bg-accent/10 text-accent ring-2 ring-accent/20' : 'border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-primary/30 dark:text-slate-300'}">
                            ${s}
                        </button>
                    `).join('')}
                    </div>
            </div>
        </div>`;
    } else if (activeOverlay === 'edit-profile') {
        content = `
            <div class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            <div class="absolute inset-0 bg-black/60 backdrop-blur-sm modal-bg fade-enter-active" onclick="closeOverlay()"></div>
            <div class="bg-white dark:bg-background-card w-full max-w-lg rounded-t-2xl sm:rounded-2xl p-6 relative z-10 shadow-2xl modal-content modal-enter-active">
                    <div class="w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mb-6 sm:hidden"></div>
                    <div class="flex justify-between items-center mb-6">
                         <h2 class="text-2xl font-bold text-slate-900 dark:text-white">Edit Profile</h2>
                         <button onclick="closeOverlay()" class="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-primary/20"><span class="material-icons">close</span></button>
                    </div>
                    <form onsubmit="updateProfile(event)" class="space-y-5">
                        <div class="flex justify-center mb-6">
                        <img src="${userProfile.avatar}" class="w-24 h-24 rounded-full border-4 border-slate-100 dark:border-primary/20 shadow-lg" />
                        </div>
                        <input name="fullName" value="${userProfile.name}" class="w-full rounded-xl border-slate-200 bg-slate-50 dark:bg-primary/10 dark:text-white p-3.5 focus:ring-accent" placeholder="Name" />
                        <input name="role" value="${userProfile.role}" class="w-full rounded-xl border-slate-200 bg-slate-50 dark:bg-primary/10 dark:text-white p-3.5 focus:ring-accent" placeholder="Role" />
                        <input name="businessName" value="${userProfile.businessName}" class="w-full rounded-xl border-slate-200 bg-slate-50 dark:bg-primary/10 dark:text-white p-3.5 focus:ring-accent" placeholder="Business Name" />
                        <button type="submit" class="w-full bg-primary hover:bg-primary-light text-white py-4 rounded-xl font-bold active:scale-[0.98] transition-transform">Save Changes</button>
                    </form>
            </div>
        </div>
        `;
    } else if (activeOverlay === 'sidebar') {
            content = `
            <div class="fixed inset-0 z-50 flex">
            <div class="absolute inset-0 bg-black/50 backdrop-blur-sm fade-enter-active" onclick="closeOverlay()"></div>
            <div class="relative w-80 bg-background-light dark:bg-background-dark h-full shadow-2xl flex flex-col sidebar-content slide-enter-active">
                <div class="p-6 border-b border-gray-200 dark:border-primary/20 flex items-center gap-3">
                        <img src="${userProfile.avatar}" class="w-12 h-12 rounded-full border-2 border-primary" />
                        <div><h3 class="font-bold text-slate-800 dark:text-white text-lg">${userProfile.name}</h3></div>
                </div>
                <nav class="flex-1 p-4 space-y-2">
                    <button onclick="navigate('dashboard'); closeOverlay()" class="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl hover:bg-slate-100 dark:hover:bg-primary/10 text-slate-700 dark:text-slate-300 font-medium transition-colors"><span class="material-icons">dashboard</span> Dashboard</button>
                    <button onclick="navigate('orders'); closeOverlay()" class="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl hover:bg-slate-100 dark:hover:bg-primary/10 text-slate-700 dark:text-slate-300 font-medium transition-colors"><span class="material-icons">receipt_long</span> Orders</button>
                    <button onclick="navigate('customers'); closeOverlay()" class="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl hover:bg-slate-100 dark:hover:bg-primary/10 text-slate-700 dark:text-slate-300 font-medium transition-colors"><span class="material-icons">people</span> Customers</button>
                    <button onclick="navigate('services'); closeOverlay()" class="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl hover:bg-slate-100 dark:hover:bg-primary/10 text-slate-700 dark:text-slate-300 font-medium transition-colors"><span class="material-icons">category</span> Services</button>
                     <button onclick="navigate('settings'); closeOverlay()" class="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl hover:bg-slate-100 dark:hover:bg-primary/10 text-slate-700 dark:text-slate-300 font-medium transition-colors"><span class="material-icons">settings</span> Settings</button>
                </nav>
            </div>
            </div>
            `;
    } else if (activeOverlay === 'search') {
        content = `
        <div class="fixed inset-0 z-50 bg-background-light dark:bg-background-dark flex flex-col fade-enter-active">
                <div class="flex items-center gap-4 p-4 border-b border-gray-200 dark:border-primary/20">
                <button onclick="closeOverlay()" class="p-2"><span class="material-icons text-2xl">arrow_back</span></button>
                <input type="text" autofocus placeholder="Search..." class="flex-1 bg-transparent border-none text-xl h-12 focus:ring-0 text-slate-900 dark:text-white" />
                </div>
                <div class="flex-1 flex flex-col items-center justify-center p-6 text-center text-slate-400">
                <span class="material-icons text-8xl mb-6 opacity-20">manage_search</span>
                <p class="text-xl">Start typing to search...</p>
                </div>
        </div>
        `;
    }

    container.innerHTML = content;
}

function renderBottomNav() {
    if (appState.currentPage === 'tracking') {
        document.getElementById('bottom-nav-container').innerHTML = '';
        return;
    }
    
    const navItems = [
        { page: 'dashboard', icon: 'dashboard', label: 'Home' },
        { page: 'orders', icon: 'receipt_long', label: 'Orders' },
        { page: 'customers', icon: 'people', label: 'Clients' },
        { page: 'services', icon: 'category', label: 'Services' },
        { page: 'settings', icon: 'settings', label: 'Settings' },
    ];

    const html = `
    <nav class="bg-white/90 dark:bg-background-dark/95 border-t border-gray-200 dark:border-primary/30 backdrop-blur-lg pt-2 pb-6 sm:pb-2 px-4 shadow-[0_-5px_20px_rgba(0,0,0,0.05)]">
        <div class="max-w-xl mx-auto flex justify-between items-center">
            ${navItems.map(item => {
                const isActive = appState.currentPage === item.page;
                const colorClass = isActive ? 'text-accent dark:text-white -translate-y-1' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300';
                return `
                <button onclick="navigate('${item.page}')" class="flex flex-col items-center p-2 rounded-xl transition-all duration-300 group ${colorClass}">
                    <div class="relative p-1 rounded-full ${isActive ? 'bg-accent/10 dark:bg-white/10' : ''}">
                        <span class="material-icons ${isActive ? '' : 'material-icons-outlined'} text-2xl mb-0.5">${item.icon}</span>
                    </div>
                    <span class="text-[10px] font-medium ${isActive ? 'opacity-100' : 'opacity-70'}">${item.label}</span>
                </button>
                `;
            }).join('')}
        </div>
    </nav>`;
    
    document.getElementById('bottom-nav-container').innerHTML = html;
}

function render() {
    const app = document.getElementById('app');
    renderBottomNav();
    
    // Clear prev content
    app.innerHTML = '';

    // Simple routing
    switch (appState.currentPage) {
        case 'dashboard': app.innerHTML = renderDashboard(); break;
        case 'orders': app.innerHTML = renderOrders(); break;
        case 'customers': app.innerHTML = renderCustomers(); break;
        case 'services': app.innerHTML = renderServices(); break;
        case 'settings': app.innerHTML = renderSettings(); break;
        case 'tracking': app.innerHTML = renderTracking(); break;
        default: app.innerHTML = renderDashboard();
    }
}

// --- INIT ---
window.addEventListener('load', () => {
    render();
});