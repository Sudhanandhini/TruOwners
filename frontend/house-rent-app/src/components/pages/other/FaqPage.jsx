// src/components/FAQ.jsx
import React, { useState } from 'react';
import './FaqPage.css';

const faqData = [
    {
        question: "Is this website really 'no broker'? How do you make money then?",
        answer:
            "Yes, truly no brokers. We earn by offering optional paid services like listing promotion, legal help, and home loans — not through commissions.",
    },
    {
        question: "Will I get genuine buyers or tenants here?",
        answer:
            "Absolutely. We verify users and listings through phone numbers, documents, and activity monitoring to reduce fraud.",
    },
    {
        question: "Do I have to pay anything to contact an owner or tenant?",
        answer:
            "Basic contact is free. For faster access or premium visibility, optional paid plans are available.",
    },
    {
        question: "Do you offer legal or rental agreement help?",
        answer:
            "Yes. We offer online rental agreement services and legal documentation at flat rates.",
    },
];

const FAQ = () => {
    const [activeIndex, setActiveIndex] = useState(null);

    const toggleFAQ = (index) => {
        setActiveIndex((prevIndex) => (prevIndex === index ? null : index));
    };

    return (


        <div className="faq-container1">

            {/* Section 1: Banner */}
            <section className="terms-banner">
                <h1>Privacy Policy</h1>
            </section>


             <section className='faq-container'>
            <h2>Frequently Asked Questions</h2>
            {faqData.map((faq, index) => (
                <div key={index} className={`faq-item ${activeIndex === index ? 'active' : ''}`}>
                    <div className="faq-question" onClick={() => toggleFAQ(index)}>
                        {faq.question}
                        <span className="faq-icon">{activeIndex === index ? '-' : '+'}</span>
                    </div>
                    {activeIndex === index && <div className="faq-answer">{faq.answer}</div>}
                </div>
              
            ))}
            </section>
        </div>
    );
};

export default FAQ;
