"use client";
import { BlockNoteView, useBlockNote } from "@blocknote/react";
import "@blocknote/core/style.css";
import { uploadFileToServer } from "@/functions";

export default function Editor({ setValue, value }) {
  const editor = useBlockNote({
    initialContent: value ? JSON.parse(value) : undefined,
    onEditorContentChange: (editor) => {
      const save = async () => {
        setValue(JSON.stringify(editor.topLevelBlocks));
      };
      save();
    },

    uploadFile: async (file) => {
      try {
        const uploadedFileURL = await uploadFileToServer(file);
        return uploadedFileURL;
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
  });

  return (
    <div>
      <BlockNoteView editor={editor} />
    </div>
  );
}
