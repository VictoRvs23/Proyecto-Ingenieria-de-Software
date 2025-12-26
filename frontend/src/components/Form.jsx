import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import '../styles/form.css';

const Form = ({ fields, buttonText, onSubmit, loading }) => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [showPasswords, setShowPasswords] = useState({});

  const togglePassword = (fieldName) => {
    setShowPasswords(prev => ({
      ...prev,
      [fieldName]: !prev[fieldName]
    }));
  };

  return (
    <form className="login-stack" onSubmit={handleSubmit(onSubmit)}>
      {fields.map((field, index) => (
        <div key={index} className="input-group">
          <label htmlFor={field.name}>{field.label}</label>
          
          {field.type === 'password' ? (
            <div className="password-wrapper">
              <input
                id={field.name}
                type={showPasswords[field.name] ? "text" : "password"}
                placeholder={field.placeholder}
                className={`password-input ${errors[field.name] ? "border-red-500" : ""}`}
                {...register(field.name, { 
                  required: field.required ? "Este campo es obligatorio" : false,
                  ...field.validation 
                })}
              />
              <button 
                type="button" 
                onClick={() => togglePassword(field.name)}
                className="toggle-password-btn"
                tabIndex="-1"
              >
                {showPasswords[field.name] ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          ) : (
            <input
              id={field.name}
              type={field.type}
              placeholder={field.placeholder}
              className={errors[field.name] ? "border-red-500" : ""}
              {...register(field.name, { 
                required: field.required ? "Este campo es obligatorio" : false,
                ...field.validation 
              })}
            />
          )}
          {errors[field.name] && (
            <span style={{ color: 'red', fontSize: '0.8rem', marginTop: '5px' }}>
              {errors[field.name].message}
            </span>
          )}
        </div>
      ))}

      <button 
        type="submit" 
        className="btn-main-green"
        disabled={loading}
      >
        {loading ? "Cargando..." : buttonText}
      </button>
    </form>
  );
};

export default Form;