import { Link } from "react-router-dom";
import { CONTACT_EMAIL, ORG_NAME } from "../../config.js";

// DRAFT COPY: have the final text reviewed (GDPR, minors, photo/video consent) before launch.
const S = ({ t, children }) => <section className="mb-8"><h2 className="mb-2 text-2xl">{t}</h2><div className="space-y-2">{children}</div></section>;
export default function Privacy() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="mb-6 text-3xl">Privacy</h1>
      <S t="What we keep"><p>{ORG_NAME} keeps the name and email address from your Google account, the tickets you bought, and anything you submit yourself, such as a performance registration, feedback or an expense claim.</p></S>
      <S t="Performers and minors"><p>Performance registrations list participants and a record of their consent to photo and video use. For participants under 18 we also keep a guardian's name and email address.</p></S>
      <S t="Who can see it"><p>Only organisers with a role for the event, and only the parts they need for their work. Finance details are limited to people with finance access.</p></S>
      <S t="Your rights"><p>You can download your data or delete your account at any time from <Link to="/account/privacy">Privacy &amp; data</Link>. Some records, such as financial entries, may be kept in anonymised form.</p></S>
      <S t="Contact"><p>Questions? Write to <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.</p></S>
    </div>
  );
}
