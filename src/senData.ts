import { app } from "./firebaseConfig";
import { collection, getFirestore, doc, addDoc, setDoc, getDoc } from "firebase/firestore";

const firestore = getFirestore(app);
const db = getFirestore(app);

export async function SendDataSubCollection(Data: any, id: any, name: string) {
    const docRef = doc(firestore, `lista-materia/${id}`);
    console.log("subcoleccion: " + name + " id " + id + " Data " + Data);
    try {
      const subcoleccionRef = collection(docRef, name);
      await addDoc(subcoleccionRef, { Data: Data });
      console.log("Subcoleccion creada exitosamente");
      return "true";
    } catch (error) {
      console.error("Error al enviar el documento:", error);
      return "null";
    }
  }

export async function SendData({ IdDocument }: { IdDocument: string }, NewData: any,) {
   // const parentDocumentRef = doc(db, `lista-materiales/${IdDocument}`);
     const docRef = doc(firestore, `lista-materia/${IdDocument}`);
    /*  const consult = await getDoc(parentDocumentRef);
      if (consult.exists()) {
        const Data = consult.data();
        console.log(Data)
      }*/
      
     await setDoc(docRef, { Data: NewData });
  }