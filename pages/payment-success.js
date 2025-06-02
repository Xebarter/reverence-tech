export default function PaymentSuccess() {
  return (
    <div className="min-h-screen bg-[#fff6ea] flex items-center justify-center">
      <div className="text-center bg-white p-10 rounded-2xl shadow-lg">
        <h1 className="text-3xl font-bold text-[#00d66b] mb-4">
          Payment Successful!
        </h1>
        <p className="text-gray-700 mb-6">
          Thank you for your purchase. We’ll contact you soon to start your project.
        </p>
        <a
          href="/"
          className="inline-block py-3 px-6 bg-[#ff5831] text-white rounded-lg font-semibold hover:bg-[#e04a29]"
        >
          Back to Home
        </a>
      </div>
    </div>
  );
}