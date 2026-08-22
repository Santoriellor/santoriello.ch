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
    <section id="contact" className="section contact" ref={sectionRef}>
      <h1 className="contact-title reveal">
        &lt; {translate("contactMe")} &gt;
      </h1>
      <div className="separator reveal"></div>
      <div className="contact-content">
        <p className="contact-descr reveal">{translate("contactText")}</p>
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
          {/*
            Web3Forms honeypot. A real visitor never sees this field and never
            checks it; a bot that fills every input does, and Web3Forms then
            drops the submission. The access_key above is a public endpoint
            identifier, not a secret — it must be in the bundle for the form to
            work at all — so this is the only spam defence that can live in
            this repository. Domain restriction and captcha are dashboard
            settings; see docs/technical.md.
          */}
          <input
            type="checkbox"
            name="botcheck"
            style={{ display: "none" }}
            tabIndex="-1"
            autoComplete="off"
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
            name="message"
            placeholder={translate("contactMsg")}
            required
          ></textarea>
          <button type="submit" className="btn-outline">
            {translate("contactBtn")}
          </button>
        </form>
      </div>
      <Footer />
    </section>
  );
};

export default Contact;
