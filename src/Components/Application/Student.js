import { Star } from "lucide-react";

const Student = ({ student, onConfirm,isConfirmed,  disabled }) => {
  return (
    <section className="container mx-auto px-4 mb-8">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">
          {student.name}
          {isConfirmed && <span className="ml-2 text-green-600">(Confirmed)</span>}
        </h2>
        <table className="w-full mb-4">
          <thead>
            <tr className="text-left border-b">
              <th className="pb-2">Name</th>
              <th className="pb-2">Location</th>
              <th className="pb-2">Rate</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b">
              <td className="py-3">
                <div className="flex items-center gap-2">
                  <img
                    src={student.avatar || "/placeholder.svg"}
                    alt={`${student.name}'s avatar`}
                    className="h-10 w-10 rounded-full"
                  />
                  <span>{student.name}</span>
                </div>
              </td>
              <td>{student.location}</td>
              <td>
                <div className="flex">
                  {[...Array(5)].map((_, index) => (
                    <Star
                      key={index}
                      className={`h-4 w-4 ${
                        index < student.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        {!isConfirmed && (
          <button
            onClick={onConfirm}
            disabled={disabled}
            className="bg-purple-700 text-white px-4 py-2 rounded-md hover:bg-purple-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Confirm
          </button>
        )}
      </div>
    </section>
  );
};

Student.defaultProps = {
  student: {},
  isConfirmed: false,
  onConfirm: () => {},
  disabled: false,
};

export default Student;