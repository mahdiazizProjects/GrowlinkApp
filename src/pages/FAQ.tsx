import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDown, ChevronUp } from 'lucide-react'

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const faqs = [
    {
      question: "How does GrowLink work?",
      answer: "GrowLink connects mentees with curated mentors through structured sessions and community events. You can browse mentors, book virtual or in-person sessions at partner venues, and participate in community hangouts. Our 1% habit-based mentorship system helps you build sustainable growth through small daily actions."
    },
    {
      question: "What's the difference between virtual and in-person sessions?",
      answer: "Virtual sessions are conducted online via video call and cost $75/hour. In-person sessions take place at partner venues (libraries, co-working spaces, community centers) and cost $50/hour - that's a $25 discount! In-person sessions also earn bonus rating points, making it easier to build your reputation on the platform."
    },
    {
      question: "How do I become a mentor?",
      answer: "You can apply to become a mentor by visiting our 'Become a Mentor' page. We review all applications to ensure quality and alignment with our community values. Mentors are vetted for expertise, communication skills, and commitment to helping others grow."
    },
    {
      question: "What is the 1% habit-based mentorship system?",
      answer: "Our habit-based system focuses on identity-based goals and small, daily actions that compound over time. Instead of overwhelming changes, you'll work with your mentor to build 1% improvements through consistent habits. This approach creates sustainable, long-term growth."
    },
    {
      question: "How do I book a session?",
      answer: "Browse our mentor directory, click on a mentor's profile, and select 'Book Session'. Choose between virtual or in-person, select a date and time (sessions are scheduled in 15-minute intervals), and provide a topic for discussion. You can also use the 'Book Now' button for immediate booking."
    },
    {
      question: "Can I cancel or reschedule a session?",
      answer: "Yes, you can cancel or reschedule sessions, but we ask for at least 24 hours notice when possible. Cancellations within 24 hours may be subject to our cancellation policy. Contact your mentor directly or reach out to support for assistance."
    },
    {
      question: "What are partner venues?",
      answer: "Partner venues are local spaces (libraries, co-working spaces, community centers) that have partnered with GrowLink to host mentorship sessions. These venues offer discounted rates and provide welcoming environments for in-person connections."
    },
    {
      question: "How does the rating system work?",
      answer: "After completing a session, both mentors and mentees can provide ratings and feedback. In-person sessions earn bonus rating points, helping you build your reputation faster. Higher ratings unlock exclusive features and opportunities on the platform."
    },
    {
      question: "What membership tiers are available?",
      answer: "We offer three membership tiers: Standard, Premium, and Exclusive. Each tier provides different levels of access to mentors, events, and features. Exclusive members get priority booking, access to top-tier mentors, and invitations to special events."
    },
    {
      question: "Is my information secure?",
      answer: "Yes, we take privacy and security seriously. Your personal information is encrypted and stored securely. We never share your data with third parties without your explicit consent. You can control your privacy settings in your profile."
    },
    {
      question: "What if I have a problem with a mentor or mentee?",
      answer: "If you encounter any issues, please report them immediately through our contact form or email safety@growlink.com. We investigate all reports promptly and take appropriate action to maintain a safe, respectful community."
    },
    {
      question: "Can I attend events without being a member?",
      answer: "Some events are open to the public, while others are exclusive to members. Check the event details for specific requirements. Becoming a member gives you access to more events and networking opportunities."
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 to-primary-800 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-6">Frequently Asked Questions</h1>
          <p className="text-xl text-primary-100">
            Everything you need to know about GrowLink
          </p>
        </div>
      </section>

      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-lg overflow-hidden"
              >
                <button
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                >
                  <span className="text-lg font-semibold text-gray-900 pr-4">
                    {faq.question}
                  </span>
                  {openIndex === index ? (
                    <ChevronUp className="text-primary-600 flex-shrink-0" size={20} />
                  ) : (
                    <ChevronDown className="text-gray-400 flex-shrink-0" size={20} />
                  )}
                </button>
                {openIndex === index && (
                  <div className="px-6 pb-4">
                    <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Still Have Questions */}
          <div className="mt-12 bg-gradient-to-br from-primary-600 to-primary-800 rounded-xl shadow-xl p-8 md:p-12 text-white text-center">
            <h2 className="text-3xl font-bold mb-4">Still Have Questions?</h2>
            <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
              Can't find what you're looking for? Our support team is here to help.
            </p>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 px-8 py-3 bg-white text-primary-600 rounded-lg font-semibold hover:bg-primary-50 transition-colors"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

