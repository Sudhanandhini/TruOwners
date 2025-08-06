import React from 'react';
import './TermConditionPage.css';

const TermsAndConditions = () => {
    return (
        <div className="terms-container">
            {/* Section 1: Banner */}
            <section className="terms-banner">
                <h1>Terms & Conditions</h1>
            </section>

            {/* Section 2: Content */}
            <section className="terms-content">
                <p className="updated-date">Last Updated on 29 May, 2023</p>

                <h2>1. DEFINITIONS</h2>
                <p>
                    Unless otherwise specified, the capitalized terms shall have the meanings set out below:
                </p>

                <ul>
                    <li>
                        <strong>Account</strong> means and includes the account created on the Site, by the User, in accordance with the terms of the Agreement, registered with and approved by NoBroker.
                    </li>
                    <li>
                        <strong>Agreement</strong> means and includes the Terms and Conditions, Privacy Policy and any other such terms and conditions that may be mutually agreed upon between NoBroker and the User in relation to the Services.
                    </li>
                    <li>
                        <strong>Applicable Law</strong> means and includes any statute, law, regulation, sub-ordinate legislation, ordinance, rule, judgment, rule of law, order (interim or final), writ, decree, clearance, Authorizations...
                    </li>
                    <li>
                        <strong>Broker</strong> means and includes all brokers, channel partners, sales agencies and other third parties who/which negotiate or act on behalf of one person in a transaction of transfer...
                    </li>
                    <li>
                        <strong>Computer Virus</strong> means and includes any computer instruction, information, data or programme that destroys, damages, degrades or adversely affects the performance of a computer resource...
                    </li>
                    <li>
                        <strong>Confidential Information</strong> means and includes all information that is not in the public domain, in spoken, printed, electronic or any other form or medium, relating directly or indirectly to...
                    </li>
                    <li>
                        <strong>Content</strong> means and includes any information all data and information on the Site.
                    </li>
                    <li>
                        <strong>Government Authority</strong> means and includes any government, any state or other political subdivision thereof...
                    </li>
                </ul>
            </section>
        </div>
    );
};

export default TermsAndConditions;
