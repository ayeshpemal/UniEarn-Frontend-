// GroupTeam.jsx
import { Star } from "lucide-react";
import PropTypes from 'prop-types';
import { memo } from 'react';

const StarRating = memo(({ rating }) => (
  <div className="flex">
    {[...Array(5)].map((_, index) => (
      <Star
        key={index}
        className={`h-4 w-4 ${
          index < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
        }`}
      />
    ))}
  </div>
));

const MemberRow = memo(({ member, onMemberClick }) => (
  <tr className="border-b">
    <td className="py-3">
      <div 
        className="flex items-center gap-2 cursor-pointer hover:text-purple-700"
        onClick={() => onMemberClick(member.id)}
      >
        <img
          src={member.avatar || "/placeholder.svg"}
          alt={`${member.name}'s profile picture`}
          className="h-10 w-10 rounded-full hover:ring-2 hover:ring-purple-400 transition-all"
          onError={(e) => {
            e.target.src = "/placeholder.svg";
          }}
        />
        <span className="font-medium hover:underline">{member.name}</span>
      </div>
    </td>
    <td className="text-gray-600">{member.location}</td>
    <td>
      <StarRating rating={member.rating} />
    </td>
  </tr>
));

const GroupTeam = ({ 
  groupName, 
  members = [], 
  onConfirm = () => {}, 
  isConfirmed = false,
  status = "PENDING",
  disabled = false,
  onClickMember = () => {}
}) => {
  return (
    <section className="container mx-auto px-4 mb-8">
      <div className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
        <h2 className="text-xl font-bold mb-4">
          {groupName}
          {status === "CONFIRMED" && (
            <span className="ml-2 text-green-600 text-sm font-medium">
              (Confirmed)
            </span>
          )}
          {status === "ACCEPTED" && (
            <span className="ml-2 text-blue-600 text-sm font-medium">
              (Accepted)
            </span>
          )}
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] mb-4">
            <thead>
              <tr className="text-left border-b">
                <th className="pb-2">Member</th>
                <th className="pb-2">Location</th>
                <th className="pb-2">Rating</th>
              </tr>
            </thead>
            <tbody>
              {members.map((member) => (
                <MemberRow key={member.id} member={member} onMemberClick={onClickMember} />
              ))}
            </tbody>
          </table>
        </div>

        {!isConfirmed && (
          <button
            onClick={onConfirm}
            disabled={disabled}
            className="bg-purple-700 text-white px-4 py-2 rounded-md hover:bg-purple-800 
              transition-colors disabled:opacity-50 disabled:cursor-not-allowed
              focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-offset-2"
            aria-label={`Confirm ${groupName} application`}
          >
            Confirm Group
          </button>
        )}
      </div>
    </section>
  );
};

GroupTeam.propTypes = {
  groupName: PropTypes.string.isRequired,
  members: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    name: PropTypes.string.isRequired,
    location: PropTypes.string.isRequired,
    rating: PropTypes.number.isRequired,
    avatar: PropTypes.string
  })),
  onConfirm: PropTypes.func,
  isConfirmed: PropTypes.bool,
  status: PropTypes.string,
  disabled: PropTypes.bool,
  onClickMember: PropTypes.func
};

export default GroupTeam;