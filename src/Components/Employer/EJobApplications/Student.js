import { Star } from "lucide-react";

// Add status prop to Student component
const Student = ({ student, onConfirm, isConfirmed, status, disabled, onStudentClick }) => {
  return (
    <section className="container mx-auto px-4 mb-8">
      <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
        <h2 className="text-xl font-bold mb-4">
          {student.name}
          {status === "CONFIRMED" && <span className="ml-2 text-green-600">(Confirmed)</span>}
          {status === "ACCEPTED" && <span className="ml-2 text-blue-600">(Accepted)</span>}
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
                <div 
                  className="flex items-center gap-2 cursor-pointer hover:text-purple-700" 
                  onClick={() => onStudentClick(student.studentId)}
                >
                  <img
                    src={student.avatar || "/placeholder.svg"}
                    alt={`${student.name}'s avatar`}
                    className="h-10 w-10 rounded-full hover:ring-2 hover:ring-purple-400 transition-all"
                  />
                  <span className="hover:underline">{student.name}</span>
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
  status: "PENDING",
  onConfirm: () => {},
  disabled: false,
  onStudentClick: () => {}
};

export default Student;