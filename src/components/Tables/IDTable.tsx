import Image from "next/image";
import { useEffect, useState } from "react"
import db from "@/app/lib/firestore";
import { collection, getDocs, doc, deleteDoc } from "firebase/firestore"
import { LoaderSmall } from "../common/Loader";


const IdentificationTable = () => {
  // const querySnapshot = doc(db, 'items', process.env.NEXT_PUBLIC_FIRESTORE_ID!)
  const [items, setItems] = useState([])

  useEffect(() => {
    const fetchItems = async () => {
      const querySnapshot = await getDocs(collection(db, "items"))
      setItems(querySnapshot.docs.map((doc) => ({ 
        ...doc.data(),
         id: doc.id 
    })) as any)
    }

    fetchItems()
  }, [])

  const handleDelete = async (id:any) => {
    const itemRef = doc(db, "items", id)
    try {
      await deleteDoc(itemRef)
      alert("Item deleted successfully")
    } catch (error) {
      console.error("Error deleting document: ", error)
      alert("Error deleting item")
    }
  }
  console.log(items)
  
  return (
    <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
      <div className="px-4 py-6 md:px-6 xl:px-7.5">
        <h4 className="text-xl font-semibold text-black dark:text-white">
          Find Lost IDs 
        </h4>
      </div>

      <div className="grid grid-cols-6 border-t border-stroke px-5 py-4.5 dark:border-strokedark sm:grid-cols-8 md:px-6 2xl:px-7.5">
        <div className="col-span-3 flex items-center">
          <p className="font-medium">Identification Name</p>
        </div>
        <div className="col-span-2 hidden items-center sm:flex">
          <p className="font-medium">Category</p>
        </div>
        <div className="col-span-2 flex items-center">
          <p className="font-medium">Reward</p>
        </div>
        <div className="col-span-1 flex items-center">
          <p className="font-medium"></p>
        </div>
        {/* <div className="col-span-1 flex items-center">
          <p className="font-medium">Location</p>
        </div> */}
      </div>

      {items && items.length >= 1 ? items.map((product:any) => (
        <div
          className="grid grid-cols-6 border-t border-stroke px-4 py-4.5 dark:border-strokedark sm:grid-cols-8 md:px-6 2xl:px-7.5"
          key={product?.id}
        >
          <div className="col-span-3 flex items-center">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="h-12.5 w-15 rounded-md cursor-pointer">
                <Image
                  src={product?.image}
                  width={60}
                  height={50}
                  alt="Product"
                />
              </div>
              <p className="text-sm text-black dark:text-white cursor-pointer">
                {product?.name}
              </p>
            </div>
          </div>
          <div className="col-span-2 hidden items-center sm:flex">
            <p className="text-sm text-black dark:text-white">
              {product?.category}
            </p>
          </div>
          <div className="col-span-2 flex items-center">
            <p className="text-sm text-black dark:text-white">
              ${product.price} : {product.profit}
            </p>
          </div>
          <div className="col-span-1 flex items-center pointer"  onClick={()=>handleDelete(product.id)}>
            <p className="text-sm text-meta-3 cursor-pointer">Delete Item</p>
          </div>
    
        </div> 
      )) : <div><LoaderSmall /></div>}
    </div>
  );
};

export default IdentificationTable;
