export default function DeliveryAndPickupPage() {
  return (
    <div className="bg-[#F1F8E4] text-[#4F4A35] font-sans p-5">
      <style jsx global>{`
        h1, h2, h3 {
          color: #A3C86C;
        }
      `}</style>
      <div className="max-w-4xl mx-auto p-5 bg-[#F1F8E4]">
        <h1 className="text-center text-4xl mb-5 font-headline">Delivery and Pickup</h1>

        <p className="leading-relaxed mb-5">
          <strong>Delivery:</strong> Bumba's Kitchen offers home delivery within specific areas. Delivery times are
          estimated and may vary due to factors beyond our control, such as traffic or weather conditions. You agree to
          provide accurate delivery information, and we will not be responsible for any failed deliveries due to incorrect
          information provided.
        </p>

        <p className="leading-relaxed mb-5">
          <strong>Pickup:</strong> If you choose to pick up your order, you will be notified when your order is ready. You
          are responsible for collecting your order within the designated time window. Bumba's Kitchen is not responsible
          for any orders left uncollected beyond this time frame.
        </p>
      </div>
    </div>
  );
}
