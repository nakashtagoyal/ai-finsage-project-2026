// import "./Footer.css";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-links">
        <a href="/">Home</a>
        <a href="/contact">Contact Us</a>
        <a href="/feedback">Feedback</a>
      </div>

      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} FinSage AI. All Rights Reserved.</p>
        <p>Thank you for visiting us.</p>
      </div>
    </footer>
  );
}

export default Footer;