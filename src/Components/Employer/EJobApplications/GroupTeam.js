// GroupTeam.jsx
import { Star, Check } from "lucide-react";
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

const MemberRow = memo(({ 
  member, 
  onMemberClick, 
  showFeedbackButton, 
  onFeedbackClick, 
  applicationId,
  jobStatus
}) => {
  const isFinishedAndRated = jobStatus === "FINISH" && member.rated;
  
  return (
    <tr className="border-b">
      <td className="py-3">
        <div 
          className="flex items-center gap-2 cursor-pointer hover:text-purple-700"
          onClick={() => onMemberClick(member.id)}
        >
          <img
            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=random`}
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
      <td>
        {showFeedbackButton && !member.rated ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onFeedbackClick(member.id, applicationId);
            }}
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1.5 rounded-md text-sm font-medium flex items-center transition-all duration-200"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path>
            </svg>
            Give Feedback
          </button>
        ) : isFinishedAndRated && (
          <div className="flex items-center bg-green-50 text-green-600 px-3 py-1.5 rounded-md text-sm">
            <Check className="h-4 w-4 mr-1" />
            <span className="font-medium">Feedback provided</span>
          </div>
        )}
      </td>
    </tr>
  );
});

const GroupTeam = ({ 
  groupName, 
  members = [], 
  onConfirm = () => {}, 
  isConfirmed = false,
  status = "PENDING",
  disabled = false,
  onClickMember = () => {},
  jobStatus = "PENDING",
  applicationId = null,
  onFeedbackClick = () => {}
}) => {
  const showFeedbackButtons = jobStatus === "FINISH";
  
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
                {showFeedbackButtons && <th className="pb-2">Action</th>}
              </tr>
            </thead>
            <tbody>
              {members.map((member) => (
                <MemberRow 
                  key={member.id} 
                  member={member} 
                  onMemberClick={onClickMember} 
                  showFeedbackButton={showFeedbackButtons}
                  onFeedbackClick={onFeedbackClick}
                  applicationId={applicationId}
                  jobStatus={jobStatus}
                />
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
    avatar: PropTypes.string,
    rated: PropTypes.bool
  })),
  onConfirm: PropTypes.func,
  isConfirmed: PropTypes.bool,
  status: PropTypes.string,
  disabled: PropTypes.bool,
  onClickMember: PropTypes.func,
  jobStatus: PropTypes.string,
  applicationId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onFeedbackClick: PropTypes.func
};

export default GroupTeam;