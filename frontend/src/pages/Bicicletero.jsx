// src/pages/Bicicleteros.jsx
const Bicicleteros = () => {
  const zones = [
    { id: 1, capacity: "5/15", status: "available" },
    { id: 2, capacity: "9/15", status: "available" },
    { id: 3, capacity: "1/15", status: "available" },
    { id: 4, capacity: "Lleno", status: "full" },
  ];

  return (
    <div className="zones-page">
      <h1>BICICLETEROS</h1>
      <div className="zones-grid">
        {zones.map(zone => (
          <div key={zone.id} className="zone-card">
            <button className="zone-main-btn">BICICLETERO {zone.id}</button>
            <span className={`status-badge ${zone.status}`}>
              {zone.capacity}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};