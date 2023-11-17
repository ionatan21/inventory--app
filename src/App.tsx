import "./App.css";
import axios from "axios";
import access_token from "./access_token.json";
import { useState } from "react";
import { useEffect } from "react";
import { FilterMails } from "./gmailapi";
import { FilterXML } from "./gmailapi";
import { GetFile } from "./gmailapi";
import { Findfile } from "./gmailapi";
import View from "./xml/xml-view";

interface FoodItem {
  name: string;
  price: string;
  description: string;
  calories: string;
}

interface GmailFile {
  filename: string;
  snippet: string;
  Id: string;
  EmailId: string;
}

interface Email {
  id: string;
  threadId: string;
}

interface EmailList {
  messages: Email[];
}

const scriptUrl = "http://localhost:8000/llamar_script";

function App() {
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [gmailFile, setGmailFile] = useState<GmailFile[]>([]);
  const [File, setFile] = useState("");

  function hacerSolicitud() {
    axios
      .get(scriptUrl)
      .then((response) => {
        console.log("Respuesta positiva", response);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }

  const GetFileByID =
    (EmialID: string) => (event: React.MouseEvent<HTMLButtonElement>) => {
      console.log(`Se hizo clic en el botón con el parámetro: ${EmialID}`);

      const file = GetFile(EmialID);
      if (file) {
        console.log(file);
      }
      
    };

  function areEmailsEqual(email1: GmailFile, email2: GmailFile) {
    return email1.Id === email2.Id; // Puedes ajustar esto según tus necesidades
  }

  useEffect(() => {
    console.log("inicio de efecto");
    const results = [];
    axios
      .get(
        "https://gmail.googleapis.com/gmail/v1/users/me/messages?labelIds[is:unread]",
        {
          headers: {
            Authorization: `Bearer ${access_token.access_token}`,
          },
        }
      )
      .then((response) => {
        const allMails: EmailList = response.data;
       
        
        allMails.messages.forEach((mail: Email) => {
          const messageId = mail.id;
          console.log(messageId);
          const resultadosPromise = FilterMails(messageId);
          console.log(resultadosPromise);
          resultadosPromise.then((resultados) => {
            
            if (resultados) {
              const uniqueResults = resultados.filter((result) => {
                // Verifica si el resultado no está ya guardado en el estado
                return !gmailFile.some((existingResult) =>
                  areEmailsEqual(existingResult, result)
                );
              });
              
              console.log(uniqueResults);
              
              if (resultados.length > 0) {
                setGmailFile((prevResults) => [
                  ...prevResults,
                  ...uniqueResults,
                ]);
                console.log(messageId, resultados[0].Id);
                FilterXML(messageId, resultados[0].Id);
              } else {
              }
            }
          });
        });
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);

  return (
    <>
      <button className="request-button" onClick={hacerSolicitud}>
        Solicitar nuevas facturas
      </button>
      <h1>Lista de archivos XML</h1>
      <table className="menu-table">
        <thead>
          <tr>
            <th>Nombre de Archivo</th>
            <th colSpan={2}>Asunto</th>
          </tr>
        </thead>
        <thead>
          {gmailFile.map((file) => (
            <tr key={file.Id}>
              <td>{file.snippet}</td>
              <td>{file.snippet}</td>
              <td>
                <button onClick={GetFileByID(file.EmailId)}>Ver</button>
              </td>
            </tr>
          ))}
        </thead>
      </table>
      <View gmailFileProp={Findfile} />
    </>
  );
}

export default App;