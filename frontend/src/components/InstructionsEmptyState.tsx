import { FaHighlighter, FaCloudUploadAlt, FaMagic } from 'react-icons/fa';

export default function InstructionsEmptyState() {
    return (
        <div className="max-w-3xl mx-auto px-6 mb-12">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-[#111827] mb-2">How it works</h2>
                <p className="text-[#6B7280]">Create smart templates from your documents in three simple steps.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Step 1 */}
                <div className="card-highlight flex flex-col items-center text-center p-6 rounded-2xl bg-[#FAF9F6] border border-[#E5E7EB] shadow-sm">
                    <div className="w-16 h-16 rounded-full bg-[#FFFDF0] flex items-center justify-center mb-4">
                        <FaHighlighter className="text-3xl text-[#CA8A04]" />
                    </div>
                    <h3 className="text-lg font-semibold text-[#111827] mb-2">Highlight Variables</h3>
                    <p className="text-[#6B7280] text-sm">
                        Open your Word Document and mark any text you want to change with Yellow Highlight.
                    </p>
                </div>

                {/* Step 2 */}
                <div className="card-highlight flex flex-col items-center text-center p-6 rounded-2xl bg-[#FAF9F6] border border-[#E5E7EB] shadow-sm">
                    <div className="w-16 h-16 rounded-full bg-[#FFFDF0] flex items-center justify-center mb-4">
                        <FaCloudUploadAlt className="text-3xl text-[#CA8A04]" />
                    </div>
                    <h3 className="text-lg font-semibold text-[#111827] mb-2">Upload File</h3>
                    <p className="text-[#6B7280] text-sm">
                        Drag & drop your file here. We detect the highlights automatically.
                    </p>
                </div>

                {/* Step 3 */}
                <div className="card-highlight flex flex-col items-center text-center p-6 rounded-2xl bg-[#FAF9F6] border border-[#E5E7EB] shadow-sm">
                    <div className="w-16 h-16 rounded-full bg-[#FFFDF0] flex items-center justify-center mb-4">
                        <FaMagic className="text-3xl text-[#CA8A04]" />
                    </div>
                    <h3 className="text-lg font-semibold text-[#111827] mb-2">Fill & Create</h3>
                    <p className="text-[#6B7280] text-sm">
                        Enter your new data. We generate a clean, formatted document for you.
                    </p>
                </div>
            </div>
        </div>
    );
}
