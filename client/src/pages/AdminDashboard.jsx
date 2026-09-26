import { Link } from 'react-router-dom';
import { FiImage, FiPackage, FiShoppingCart, FiRefreshCw, FiUsers, FiPlusCircle, FiShield } from 'react-icons/fi';

export default function AdminDashboard() {
  const adminLinks = [
    { title: "Manage Banners", path: "/admin/banners", icon: <FiImage className="w-8 h-8" />, desc: "Upload and organize homepage banner images." },
    { title: "Manage Products", path: "/admin/products", icon: <FiPackage className="w-8 h-8" />, desc: "Add, edit, or delete platform products." },
    { title: "Add New Product", path: "/admin/add-product", icon: <FiPlusCircle className="w-8 h-8" />, desc: "Create a new product listing in the inventory." },
    { title: "Manage Orders", path: "/admin/orders", icon: <FiShoppingCart className="w-8 h-8" />, desc: "View all customer orders and update dispatch statuses." },
    { title: "Manage Replacements", path: "/admin/replacements", icon: <FiRefreshCw className="w-8 h-8" />, desc: "Approve or reject customer replacement requests." },
    { title: "Manage Users", path: "/admin/users", icon: <FiUsers className="w-8 h-8" />, desc: "View all registered users on the platform." },
  ];

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-gray-800 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-10">
        
        {/* Header */}
        <div className="bg-white border border-[#AC666D]/30 rounded-3xl p-8 shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative overflow-hidden">
          <div className="space-y-2 relative z-10">
            <span className="bg-[#AC666D]/20 text-[#AC666D] px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-widest border border-[#AC666D]/40 flex items-center gap-1.5 w-max">
              <FiShield /> Executive Control Panel
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-800">
              Admin <span className="text-[#AC666D]">Dashboard</span>
            </h1>
            <p className="text-gray-800 text-sm sm:text-base max-w-xl">
              Select a control module below to manage store products, process orders, manage users, or update banners.
            </p>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {adminLinks.map((link, idx) => (
            <Link 
              key={idx} 
              to={link.path} 
              className="bg-white border border-[#AC666D]/30 hover:border-[#AC666D] rounded-3xl p-6 sm:p-8 flex flex-col items-start text-left space-y-4 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 group relative overflow-hidden"
            >
              <div className="bg-[#AC666D]/10 border border-[#AC666D]/30 group-hover:bg-[#AC666D] group-hover:text-white text-[#AC666D] p-4 rounded-2xl transition-colors duration-300">
                {link.icon}
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800 group-hover:text-[#AC666D] transition-colors mb-2">
                  {link.title}
                </h2>
                <p className="text-gray-800 text-sm leading-relaxed">
                  {link.desc}
                </p>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </div>
  );
}

