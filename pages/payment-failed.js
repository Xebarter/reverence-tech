export default function PaymentFailed() {
  return (
    <div className="min-h-screen bg-[#fff6ea] flex items-center justify-center">
      <div className="text-center bg-white p-10 rounded-2xl shadow-lg">
        <h1 className="text-3xl font-bold text-[#ff5831] mb-4">
          Payment Failed
        </h1>
        <p className="text-gray-700 mb-6">
          Something went wrong with your payment. Please try again or contact support.
        </p>
        <a
          href="/catalogue"
          className="inline-block py-3 px-6 bg-[#ff5831] text-white rounded-lg font-semibold hover:bg-[#e04a29]"
        >
          Try Again
        </a>
      </div>
    </div>
  );
}