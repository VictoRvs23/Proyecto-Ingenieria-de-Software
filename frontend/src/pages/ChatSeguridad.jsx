import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import '../styles/chat.css'; 
import { SiGooglemessages } from "react-icons/si"; 
import { IoClose, IoSend } from "react-icons/io5"; 

const socket = io('http://localhost:3000'); 

const ChatSeguridad = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [mensajes, setMensajes] = useState([]);
  const [mensajeActual, setMensajeActual] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const id = localStorage.getItem('userId');
    const role = localStorage.getItem('role');
    const nombre = localStorage.getItem('nombre');

    if (!['admin', 'guard', 'adminBicicletero'].includes(role)) {
        return;
    }

    setCurrentUser({ id, role, nombre });

    socket.emit('pedir_historial');

    socket.on('historial_mensajes', (lista) => {
      setMensajes(lista);
    });

    socket.on('nuevo_mensaje', (msg) => {
      setMensajes((prev) => [...prev, msg]);
    });

    return () => {
      socket.off('historial_mensajes');
      socket.off('nuevo_mensaje');
    };
  }, []);

  useEffect(() => {
    if (isOpen) {
        scrollToBottom();
    }
  }, [isOpen, mensajes]);

  const scrollToBottom = () => {
    setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const enviar = (e) => {
    e.preventDefault();
    if (mensajeActual.trim() && currentUser) {
      
      const mensajeOptimista = {
        id: Date.now(),
        contenido: mensajeActual,
        rol_sender: currentUser.role,
        usuario: { id: currentUser.id, nombre: currentUser.nombre },
        created_at: new Date().toISOString()
      };

      setMensajes((prev) => [...prev, mensajeOptimista]);
      scrollToBottom();

      socket.emit('enviar_mensaje', {
        userId: currentUser.id,
        contenido: mensajeActual,
        rol_sender: currentUser.role
      });
      
      setMensajeActual("");
    }
  };

  const getRoleBadge = (rol) => {
      if(rol === 'admin' || rol === 'adminBicicletero') return 'ADMIN';
      return 'GUARDIA';
  }

  if (!currentUser) return null;

  return (
    <div className="chat-widget-container">
      
      {isOpen && (
        <div className="chat-window">
          <div className="chat-header">
            <h3>Canal de Seguridad</h3>
            <button className="close-btn" onClick={() => setIsOpen(false)}>
                <IoClose size={24} />
            </button>
          </div>

          <div className="chat-box">
            {mensajes.map((msg, index) => {
                const msgUserId = msg.usuario?.id || msg.usuario;
                const esMio = currentUser && String(msgUserId) === String(currentUser.id);
                
                return (
                    <div key={index} className={`mensaje-wrapper ${esMio ? 'mio' : 'otro'}`}>
                        <div className="mensaje-bubble">
                            <div className="mensaje-info">
                                <span className="mensaje-nombre">
                                    {esMio ? 'Yo' : (msg.usuario?.nombre || 'Usuario')}
                                </span>
                                <span className="mensaje-rol">{getRoleBadge(msg.rol_sender)}</span>
                            </div>
                            <p className="mensaje-texto">{msg.contenido}</p>
                            <span className="mensaje-hora">
                                {new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </span>
                        </div>
                    </div>
                );
            })}
            <div ref={messagesEndRef} />
          </div>

          <form className="chat-input-area" onSubmit={enviar}>
            <input 
                type="text" 
                placeholder="Escribe un mensaje..." 
                value={mensajeActual}
                onChange={(e) => setMensajeActual(e.target.value)}
                autoFocus
            />
            <button type="submit">
                <IoSend size={18} style={{ marginLeft: '3px' }} />
            </button>
          </form>
        </div>
      )}

      <button 
        className={`chat-fab ${isOpen ? 'active' : ''}`} 
        onClick={() => setIsOpen(!isOpen)}
        title="Chat de Seguridad"
      >
        <SiGooglemessages size={28} />
      </button>

    </div>
  );
};

export default ChatSeguridad;