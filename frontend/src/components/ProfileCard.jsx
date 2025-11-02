import "@styles/profile.css";
import profilePic from "@assets/gatodosekai.png";

const ProfileCard = ({ user }) => {
  return (
    <div className="profile-card">
      <h1 className="profile-header">Perfil de {user.username}</h1>
      <div className="profile-content">
        <div className="profile-image">
          <img src={profilePic} alt={`${user.username}'s profile`} />
        </div>
        <div className="profile-info">
          <p>
            <strong>Correo:</strong> {user.email}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;