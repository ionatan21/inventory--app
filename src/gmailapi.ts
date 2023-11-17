import { useState } from "react";
import axios from "axios";
import access_token from "./access_token.json";
import { SendData } from "./senData";
import { file } from "googleapis/build/src/apis/file";

interface Factura {
  tipo: string;
  valor: string;
}

interface Email {
  id: string;
  threadId: string;
}


export let Findfile: { filename: string;
  snippet: string;
  Id: string;
  EmailId: string; }[] = [];


export const setFindfile = (newValue: { filename: string;
  snippet: string;
  Id: string;
  EmailId: string; }[]) => {
  Findfile = newValue;
};


const facturas: Factura[] = [];

export async function parseXml(xmlString: string, id: string) {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlString, "text/xml");
  console.log(xmlDoc);

  const IdDocument = xmlDoc.querySelector("Clave");
  const Emisor = xmlDoc.querySelector("Emisor");
  const Receptor = xmlDoc.querySelector("Receptor");
  const DetalleServicio = xmlDoc.querySelector("DetalleServicio");
  const ResumenFactura = xmlDoc.querySelector("ResumenFactura");

  console.log(id);

  //ID del documento
  facturas.push({ tipo: "IdDocument", valor: id });

  //quién lo envia
  if (Emisor) {
    const FilterEmisor = Emisor.querySelector("Nombre")?.textContent;
    console.log(FilterEmisor);
    if (FilterEmisor) {
      facturas.push({ tipo: "Emisor", valor: FilterEmisor });
    }
  }

  //a quién va dirigido
  if (Receptor) {
    const FilterReceptor = Receptor.querySelector("Nombre")?.textContent;
    console.log(FilterReceptor);
    if (FilterReceptor) {
      facturas.push({ tipo: "Receptor", valor: FilterReceptor });
    }
  }

  if (ResumenFactura) {
    const FilterResumenFactura = ResumenFactura.innerHTML;
    console.log(FilterResumenFactura);
    if (FilterResumenFactura) {
      facturas.push({ tipo: "ResumenFactura", valor: FilterResumenFactura });
    }
  }

  console.log("Arreglo de constantes:", facturas);

  if (DetalleServicio) {
    const LineasDetalle = Array.from(
      DetalleServicio.querySelectorAll("LineaDetalle")
    );
    console.log(DetalleServicio);
    LineasDetalle.forEach((lineaDetalle) => {
      console.log(lineaDetalle);
      const NumeroLinea =
        lineaDetalle.querySelector("NumeroLinea")?.textContent || "";
      const Codigo = lineaDetalle.querySelector("Codigo")?.textContent || "";
      const Cantidad =
        lineaDetalle.querySelector("Cantidad")?.textContent || "";
      const UnidadMedida =
        lineaDetalle.querySelector("UnidadMedida")?.textContent || "";

      const Detalle = lineaDetalle.querySelector("Detalle")?.textContent || "";
      const PrecioUnitario =
        lineaDetalle.querySelector("PrecioUnitario")?.textContent || "";
      const MontoTotal =
        lineaDetalle.querySelector("MontoTotal")?.textContent || "";

      const data = {
        NumeroLinea,
        Codigo,
        Cantidad,
        UnidadMedida,
        Detalle,
        PrecioUnitario,
        MontoTotal,
      };

      if (IdDocument) {
        const myArg = { IdDocument: Codigo };
        // SendData(myArg, data);
      }

      console.log(`Línea ${NumeroLinea}:`);
      console.log(`Código: ${Codigo}`);
      console.log(`Cantidad: ${Cantidad}`);
      console.log(`Unidad de Medida: ${UnidadMedida}`);
      console.log(`Detalle: ${Detalle}`);
      console.log(`Precio Unitario: ${PrecioUnitario}`);
      console.log(`Monto Total: ${MontoTotal}`);
    });
  }
}

export async function GetFile(ID: string) {
  const facturasEncontradas = facturas.filter((factura) =>
    factura.valor.includes(ID)
  );

  if (facturasEncontradas) {
    
    facturasEncontradas.forEach((Email) => {
      console.log(Email.valor);
      
      const result = FilterMails(Email.valor)
      console.log(result);
      result.then((resultados) => {
            
        if (resultados) {
          
          if (resultados.length > 0) {
            setFindfile([
              ...Findfile,
              ...resultados,
            ]);
          } else {
          }
        }
        console.log(Findfile);
        
      });
      
    })
    
  
    //setFindfile(facturasEncontradas);
  } else {
    return [];
  }
}

export async function FilterMails(MailID: string) {
  try {
    const response = await axios.get(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages/${MailID}`,
      {
        headers: {
          Authorization: `Bearer ${access_token.access_token}`,
        },
      }
    );

    const fileData = response.data;

    if (fileData.snippet === "Factura") {
      console.log(MailID);

      const parts = fileData.payload.parts;
      console.log(fileData);
      if (Array.isArray(parts)) {
        const filteredParts = parts.filter((part) => part !== undefined);

        // Arreglo para almacenar los resultados
        const results = [];

        // Iterar sobre las partes filtradas
        for (const part of filteredParts) {
          const mimeType = part.mimeType;

          if (mimeType === "text/xml") {
            const snippet = fileData.snippet;
            const filename = part.filename;
            const EmailId = fileData.id;
            const Id = part.body.attachmentId;

            // Agregar los datos al arreglo de resultados
            results.push({ filename, snippet, Id, EmailId });
          }
        }

        return results; // Retornar el arreglo de resultados
      }
    } else {
      console.log("No se encontraron partes en el correo electrónico.");
      return []; // Retornar un arreglo vacío en caso de no encontrar partes
    }
  } catch (error) {
    console.error("Error al obtener el correo electrónico:", error);
    throw error; // Lanzar el error para que otros puedan manejarlo si es necesario
  }
}

export async function FilterXML(mailID: string, attachmentId: any) {
  console.log(mailID, attachmentId);
  axios
    .get(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages/${mailID}/attachments/${attachmentId}`,
      {
        headers: {
          Authorization: `Bearer ${access_token.access_token}`,
        },
      }
    )
    .then((response: { data: any }) => {
      const filedata = response.data.data;

      // Decodificar los datos Base64
      const correctedBase64Data = fixBase64(filedata);
      const decodedData = atob(correctedBase64Data);
      parseXml(decodedData, mailID);
    });
}

export function fixBase64(base64String: string): string {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const correctedBase64 = (base64String + padding)
    .replace(/-/g, "+")
    .replace(/_/g, "/");
  return correctedBase64;
}
