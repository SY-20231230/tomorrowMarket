import Header from "./Header";
import Sidebar from "./Sidebar";
import "./Layout.css";

type LayoutProps = {
  children: React.ReactNode;
};

function Layout({ children }: LayoutProps) {
  return (
    <div className="layout">
      <Sidebar />
      <div className="content-area">
        <Header />
        <main className="main">{children}</main>
      </div>
    </div>
  );
}

export default Layout;
