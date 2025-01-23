import React, { useRef, useEffect, useContext } from "react";
import "../styles/Contact.css";
import Footer from "../components/Footer";

import { LanguageContext } from "../contexts/LanguageContext";

const Contact = () => {
  const sectionRef = useRef(null);
  const { translate } = useContext(LanguageContext);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.target) return;

          const sectionTitle = entry.target.querySelector(".contact-title");
          const sectionSeparator = entry.target.querySelector(".separator");
          const sectionContactDescr =
            entry.target.querySelector(".contact-descr");
          const sectionContactForm =
            entry.target.querySelector(".contact-form");
          if (entry.isIntersecting) {
            sectionTitle?.classList.add("animate");
            sectionSeparator?.classList.add("animate");
            sectionContactDescr?.classList.add("animate");
            sectionContactForm?.classList.add("animate");
          } else {
            sectionTitle?.classList.remove("animate");
            sectionSeparator?.classList.remove("animate");
            sectionContactDescr?.classList.remove("animate");
            sectionContactForm?.classList.remove("animate");
          }
        });
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section id="contact" className="contact" ref={sectionRef}>
      <h1 className="contact-title">&lt; {translate("contactMe")} &gt;</h1>
      <div className="separator"></div>
      <div className="contact-content">
        <p className="contact-descr">{translate("contactText")}</p>
        <form
          className="contact-form"
          method="POST"
          action="https://api.web3forms.com/submit"
        >
          <input
            type="hidden"
            name="access_key"
            value="c9e4e021-c095-4eb8-95f2-a93d49403bd6"
          />
          <input
            type="text"
            name="name"
            placeholder={translate("contactName")}
            required
          />
          <input
            type="email"
            name="email"
            placeholder={translate("contactEmail")}
            required
          />
          <textarea
            type="text"
            name="message"
            placeholder={translate("contactMsg")}
            required
          ></textarea>
          <button type="submit">{translate("contactBtn")}</button>
        </form>
      </div>
      <Footer />
    </section>
  );
};

export default Contact;
