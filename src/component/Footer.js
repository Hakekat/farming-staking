import React, { useState, useEffect } from "react";
import mailchimp from "@mailchimp/mailchimp_marketing";
import MailchimpSubscribe from "react-mailchimp-subscribe";

const CustomForm = ({ status, message, onValidated }) => {
  const [email, setEmail] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    email &&
      email.indexOf("@") > -1 &&
      onValidated({
        EMAIL: email,
      });
  };

  useEffect(() => {
    if (status === "success") clearFields();
    if (status === "error") clearFields();
  }, [status]);

  const clearFields = () => {
    setEmail("");
  };

  return (
    <form className="mailchimp" onSubmit={(e) => handleSubmit(e)}>
      {status === "sending" && <div style={{ color: "blue" }}>sending...</div>}
      {status === "error" && (
        <div
          style={{ color: "red" }}
          dangerouslySetInnerHTML={{ __html: 'already subscribed!' }}
        />
      )}
      {status === "success" && (
        <div
          style={{ color: "green" }}
          dangerouslySetInnerHTML={{ __html: message }}
        />
      )}
      <input
        onChange={(e) => setEmail(e.target.value)}
        value={email}
        type="email"
        placeholder="Your E-mail."
      />
      <button type="submit">Submit</button>
    </form>
  );
};


function Footer() {

  const url = "https://gmail.us20.list-manage.com/subscribe/post?u=1f94184aeedaa966e20a9f39a&amp;id=a191d73096";


  return (
    <div>
      <div className="footer">
        <div className="container">
          <div className="row">
            <div className="col-lg-6 col-md-6 col-xl-6 col-sm-12">
              <div className="invest">
                <h1>
                  Invest With The No.1
                  <br /> Rated and Curated <br /> Digital Asset Exchange
                </h1>
              </div>
              <div className="subscribe">
                <p>
                  Subscribe our newsletter to get more <br />
                  free design course and resource
                </p>
                <MailchimpSubscribe
                  url={url}
                  render={({ subscribe, status, message }) => (
                    <CustomForm
                      status={status}
                      message={message}
                      onValidated={(formData) => subscribe(formData)}
                    />
                  )}
                />
              </div>
            </div>
            <div className="col-lg-6 col-md-6 col-xl-6 col-sm-12">
              <div className="footer-links">
                <div className="row">
                  <div className="col-lg-4 col-md-4 col-xl4 col-sm-12">
                    <div className="quick-links-2">
                      <h4>We Are Kala</h4>
                      <ul>
                        <li>
                          <a href="#">Explore</a>
                        </li>
                        <li>
                          <a href="#">How it Works</a>
                        </li>
                        <li>
                          <a href="#">Create</a>
                        </li>
                        <li>
                          <a href="#">Connect Wallet</a>
                        </li>
                        <li>
                          <a href="#">Support</a>
                        </li>
                      </ul>
                    </div>
                  </div>
                  <div className="col-lg-4 col-md-4 col-xl-4 col-sm-12">
                    <div className="quick-links-2">
                      <h4>Community</h4>
                      <ul>
                        <li>
                          <a href="#">Pasukan Kala</a>
                        </li>
                        <li>
                          <a href="#">Nusakala Institute</a>
                        </li>
                        <li>
                          <a href="#">Feedback & Vote</a>
                        </li>
                        <li>
                          <a href="#">Feture</a>
                        </li>
                      </ul>
                    </div>
                  </div>
                  <div className="col-lg-4 col-md-4 col-xl-4 col-sm-12">
                    <div className="quick-links-2">
                      <h4>Talk to Us</h4>
                      <ul>
                        <li>
                          <a href="#">Telegram</a>
                        </li>
                        <li>
                          <a href="#">Instagram</a>
                        </li>
                        <li>
                          <a href="#">Twitter</a>
                        </li>
                        <li>
                          <a href="#">Medium</a>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Footer;
