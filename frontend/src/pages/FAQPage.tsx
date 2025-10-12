import Layout from '../components/Layout';

export default function FAQPage() {
  const faqs = [
    {
      question: 'What is the dress code?',
      answer: 'Formal attire is requested.',
    },
    {
      question: 'Will there be parking available?',
      answer: 'Yes, parking is available at the venue.',
    },
    {
      question: 'Can I bring a plus one?',
      answer: 'Please refer to your invitation. If your invitation includes a plus one, they are welcome to attend.',
    },
    {
      question: 'What time should I arrive?',
      answer: 'The ceremony begins at 4:00pm. Please arrive 15-20 minutes early to find your seat.',
    },
    {
      question: 'Is there a gift registry?',
      answer: 'Instead of a traditional registry, we have created a honeymoon registry for our Italy trip. You can view it on the Registry page.',
    },
    {
      question: 'Will the ceremony be indoors or outdoors?',
      answer: 'Details will be provided closer to the date.',
    },
    {
      question: 'Are children welcome?',
      answer: '[To be determined]',
    },
    {
      question: 'How do I RSVP?',
      answer: 'You will receive an email with a unique RSVP link. Please use that link to submit your response.',
    },
  ];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-serif font-bold text-center mb-12">Frequently Asked Questions</h1>

        <div className="max-w-3xl mx-auto space-y-6">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold mb-3">{faq.question}</h3>
              <p className="text-gray-700">{faq.answer}</p>
            </div>
          ))}
        </div>

        {/* Contact */}
        <div className="max-w-3xl mx-auto mt-12 bg-gray-50 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-semibold mb-4">Still have questions?</h2>
          <p className="text-gray-700">
            Feel free to reach out to us at{' '}
            <a href="mailto:contact@samandjonah.com" className="text-primary hover:underline">
              contact@samandjonah.com
            </a>
          </p>
        </div>
      </div>
    </Layout>
  );
}
