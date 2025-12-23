import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/bicicleta.css';
import { createBike, updateBikeImage } from '../services/bike.service';
import Swal from 'sweetalert2';

const AgregarBicicleta = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    brand: '',
    model: '',
    color: ''
  });

  const [imagePreview, setImagePreview] = useState('/default-bike.png');
  const [selectedFile, setSelectedFile] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!formData.brand || !formData.model || !formData.color) {
      Swal.fire({
        title: 'Campos incompletos',
        text: 'Por favor, rellena todos los campos de la bicicleta.',
        icon: 'warning',
        confirmButtonColor: '#1565C0'
      });
      return;
    }

    try {
      const response = await createBike(formData); 
      console.log('🚴 Respuesta al crear bicicleta:', response);

      if (response && response.data) {
        const newBikeId = response.data.id;
        console.log('🚴 ID de la nueva bicicleta:', newBikeId);
        console.log('🚴 ¿Hay imagen seleccionada?', !!selectedFile);
        
        if (selectedFile && newBikeId) {
          const imageFormData = new FormData();
          imageFormData.append('image', selectedFile);
          
          try {
            const imgResponse = await updateBikeImage(newBikeId, imageFormData);
            console.log('🚴 Respuesta al actualizar imagen:', imgResponse);
          } catch (imageError) {
            console.error("🚴 Error subiendo imagen:", imageError);
          }
        }
      } else {
        console.error('🚴 Respuesta no tiene el formato esperado:', response);
      }
        
      await Swal.fire({
        title: '¡Logrado!',
        text: 'Tu bicicleta ha sido registrada correctamente.',
        icon: 'success',
        confirmButtonColor: '#1b7e3c'
      });
      navigate('/home/profile');
    } catch (error) {
      console.error("Error al crear bicicleta:", error);
      Swal.fire({
        title: 'Error',
        text: 'No se pudo guardar la bicicleta.',
        icon: 'error',
        confirmButtonColor: '#d33'
      });
    }
  };

  return (
    <div id="seccion-agregar-bici">
      <div className="main-content-bici">
        <h1 className="main-title-bici">AGREGAR BICICLETA</h1>

        <div className="panels-container-bici">
            <div className="panel-box-bici">
                <div className="image-circle-bici">
                    <img 
                        src={imagePreview} 
                        alt="Bicicleta" 
                        className="bicycle-img-bici" 
                    />
                </div>
                
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  style={{ display: 'none' }} 
                  accept="image/*"
                  onChange={handleFileChange}
                />

                <button className="btn-azul-bici" onClick={handleImageClick}>
                    Agregar Imagen <br /> de Bicicleta
                </button>
            </div>

            <div className="panel-box-bici">
                <div className="form-group-bici">
                    <label className="form-label-bici">Marca</label>
                    <input 
                      type="text" 
                      name="brand"
                      className="form-input-bici" 
                      placeholder="Introduce la marca" 
                      value={formData.brand}
                      onChange={handleChange}
                    />
                </div>

                <div className="form-group-bici">
                    <label className="form-label-bici">Modelo</label>
                    <input 
                      type="text" 
                      name="model"
                      className="form-input-bici" 
                      placeholder="Introduce el modelo" 
                      value={formData.model}
                      onChange={handleChange}
                    />
                </div>

                <div className="form-group-bici">
                    <label className="form-label-bici">Color</label>
                    <select 
                      name="color"
                      className="form-input-bici" 
                      value={formData.color}
                      onChange={handleChange}
                    >
                        <option value="">Seleccionar color...</option>
                        <option value="Negro">Negro</option>
                        <option value="Blanco">Blanco</option>
                        <option value="Rojo">Rojo</option>
                        <option value="Azul">Azul</option>
                        <option value="Verde">Verde</option>
                        <option value="Gris">Gris</option>
                    </select>
                </div>
                <button className="btn-verde-bici" onClick={handleSubmit}>
                    Agregar Bicicleta
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default AgregarBicicleta;