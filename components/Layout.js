import ThemeToggle from './ThemeToggle';

const Layout = ({ children }) => {
  return (
    <div className="layout">
      <header>
        <div className="header-right">
          <ThemeToggle />
        </div>
      </header>
      <main>{children}</main>
      <footer></footer>
      
      <style jsx>{`
        .header-right {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
      `}</style>
    </div>
  );
};

export default Layout;