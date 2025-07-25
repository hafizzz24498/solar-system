import { Outlet } from "react-router"
import Sidebar from "./Sidebar"
import Header from "./Header"

const Layout = () => {
    return (
        <div className="flex h-screen">
            <Sidebar />
            <div className="flex-1 flex flex-col">
                <Header />
                <main className="p-4 bg-gray-100 flex-1 overflow-auto">
                    <Outlet />
                </main>
            </div>
            </div>
    )
}
export default Layout;