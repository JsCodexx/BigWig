// DialogWrapper.tsx
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import BoardDetailsForm from "@/components/surveys/BoardDetailsForm";
import { Button } from "@/components/ui/button";

const DialogWrapper = ({
  billboardNames,
  billboardTypes,
  user,
  newBoard,
  updateNewBoard,
  resetPreview,
  setNewBoard,
  onAddBoard,
  open,
  setOpen, // 👈 receive from parent
}: any) => {
  const openModal = (type: "name" | "type") => {
    console.log("Opening modal for:", type);
  };

  return (
    <div className="w-full max-w-7xl">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <button className="bg-red-600 text-white px-4 py-2 rounded">
            Open Board Form
          </button>
        </DialogTrigger>

        <DialogContent className="max-w-3xl overflow-y-auto max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="text-lg text-red-600">
              Board Details
            </DialogTitle>
          </DialogHeader>

          <BoardDetailsForm
            billboardNames={billboardNames}
            billboardTypes={billboardTypes}
            newBoard={newBoard}
            userRole={user?.user_role || ""}
            updateNewBoard={updateNewBoard}
            openModal={openModal}
            resetPreview={resetPreview}
            setNewBoard={setNewBoard}
          />

          <div className="flex w-full justify-end mt-4 gap-4">
            <DialogClose asChild>
              <button className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600">
                Close
              </button>
            </DialogClose>
            <Button
              onClick={() => {
                onAddBoard();
                setOpen(false); // ✅ close on submit
              }}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {typeof onAddBoard === "function"
                ? "Save Board"
                : "Add Shopboard"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DialogWrapper;
