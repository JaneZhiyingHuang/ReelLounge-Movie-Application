import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./GroupPage.css";
import { FaUserNinja } from "react-icons/fa";
import toast from "react-hot-toast";
import { FaPlus } from "react-icons/fa6";
import { MdOutlineMessage } from "react-icons/md";



function GroupPage() {
    const { groupId } = useParams();
    const [group, setGroup] = useState(null);
    const [members, setMembers] = useState([]);
    const [movies, setMovies] = useState([]);
    const [user, setUser] = useState(null); // State to hold user data
    const navigate = useNavigate();
    const [isMember, setIsMember] = useState(false); // Track if the user is a member
    const [review, setReview] = useState("");
    const [allReviews, setAllReviews] = useState([]);

    // Fetch group details
    useEffect(() => {
        const fetchGroup = async () => {
            try {
                const response = await axios.get(
                    `${process.env.REACT_APP_API_URL}/groups/${groupId}`
                );
                setGroup(response.data);
            } catch (error) {
                console.error("Error fetching group:", error);
            }
        };
        fetchGroup();
    }, [groupId]);

    // Fetch group members
    useEffect(() => {
        const fetchMembers = async () => {
            try {
                const response = await axios.get(
                    `${process.env.REACT_APP_API_URL}/groups/group_id/${groupId}/members`
                );
                setMembers(response.data.members); // Assuming the response contains a `members` array

                // Check if the current user is in the members list
                if (user) {
                    const isUserMember = response.data.members.some(
                        (member) => member.groupmember_users_id === user.users_id
                    );
                    setIsMember(isUserMember);
                }
            } catch (error) {
                console.error("Error fetching group members:", error);
            }
        };

        if (groupId) {
            fetchMembers();
        }
    }, [groupId, user]);

    // Fetch group movies
    useEffect(() => {
        const fetchMovies = async () => {
            try {
                const response = await axios.get(
                    `${process.env.REACT_APP_API_URL}/groups/${groupId}/movies`
                );
                setMovies(response.data); // Assuming the response is an array
            } catch (error) {
                console.error("Error fetching movies:", error);
            }
        };
        fetchMovies();
    }, [groupId]);
    

    // fetch all reviews
    useEffect(() => {
        const fetchAllReviews = async () => {
            try {
                const response = await axios.get(
                    `${process.env.REACT_APP_API_URL}/groups/${groupId}/reviews`
                );
                
                setAllReviews(response.data);
            } catch (error) {
                console.error("Error fetching reviews:", error);
            }
        };
        fetchAllReviews();
    }, []);

    // Retrieve user data from sessionStorage
    useEffect(() => {
        const storedUser = sessionStorage.getItem("user");
        if (storedUser) {
            const userData = JSON.parse(storedUser);
            setUser(userData); // Set user data
        }
    }, []);

    // Handle joining the group
    const handleJoinGroup = async () => {
        try {
            const response = await axios.post(
                `${process.env.REACT_APP_API_URL}/notification/group_id/${groupId}/join`,
                { users_id: user.users_id }
            );
            toast.success("Join request sent successfully.");
        } catch (error) {
            console.error("Error joining group:", error);
            toast.error(error.response?.data?.error || "Failed to join group.");
        }
    };

    // Handle leaving the group
    const handleLeaveGroup = async () => {
        try {
            await axios.delete(
                `${process.env.REACT_APP_API_URL}/groups/leave/${groupId}/member/${user.users_id}`
            );
            toast.success("You have successfully left the group.");
            setIsMember(false);
            navigate("/"); // Redirect to the homepage
        } catch (error) {
            console.error("Error leaving group:", error);
            toast.error(error.response?.data?.error || "Failed to leave group.");
        }
    };

    // Handle deleting the group
    const handleDeleteGroup = async () => {
        try {
            await axios.delete(`${process.env.REACT_APP_API_URL}/groups/${groupId}`, {
                data: { user_id: user.users_id },
            });
            alert("Group deleted successfully!");
            navigate("/"); // Redirect to the homepage
        } catch (error) {
            console.error("Error deleting group:", error);
            alert(error.response?.data?.error || "Failed to delete group.");
        }
    };

    // Handle removing a group member
    const handleRemoveMember = async (memberId) => {
        try {
            await axios.delete(
                `${process.env.REACT_APP_API_URL}/groups/${groupId}/member/${memberId}`,
                { data: { user_id: user.users_id } }
            );
            toast.success("Member removed successfully.");
            setMembers(members.filter((member) => member.groupmember_users_id !== memberId));
        } catch (error) {
            console.error("Error removing member:", error);
            toast.error(error.response?.data?.error || "Failed to remove member.");
        }
    };

    // Handle submitting a review
    const handleReviewSubmit = async (e, movie_id) => {
        
        e.preventDefault();

        if(review.length === 0){
            return toast.error("Please write a review.");
        }

        try {
            const reviewData = await axios.post(`${process.env.REACT_APP_API_URL}/groups/addReviewToGroupMovie`, {
                group_id: groupId,
                movie_id,
                review,
                user_id: user.users_id
            });

           

            setAllReviews([...allReviews, reviewData.data]);

            toast.success("Review submitted successfully.");
            setReview("");
        } catch (error) {
            console.error("Error submitting review:", error);
            toast.error(error.response?.data?.error || "Failed to submit review.");
        }
    };

    if (!group) {
        return <h1>Loading group details...</h1>;
    }

    return (
        <div className="group-container">
            <div className="group-card">
                <div className="group-info">
                    <h1>{group.group_name}</h1>
                    <p>{group.group_introduction}</p>
                </div>
                <div className="group-details">
                    <p>
                        Created by: <span>{group.group_owner_email.split("@")[0]}</span>
                    </p>
                    {/* Show buttons based on user role */}
                    <div className="group-btns">
                        {user && user.users_id === group.group_owner_id ? (
                            // If the user is the group owner
                            <>
                                <button onClick={handleDeleteGroup} className="delete-button">
                                    Delete Group
                                </button>
                                {/* <p>You are the group owner.</p> */}
                            </>
                        ) : (
                            // If the user is a group member but not the owner
                            user &&
                            (isMember ? (
                                <button onClick={handleLeaveGroup} className="leave-button">
                                    Leave Group
                                </button>
                            ) : (
                                <button onClick={handleJoinGroup} className="join-button">
                                    Join Group
                                </button>
                            ))
                        )}
                    </div>
                </div>
            </div>
            
            <div className="group-content">
                <div className="group-movies">
                    {movies.length > 0 ? (
                        movies.map((movie) => (
                            <div className="group-movie" key={movie.groupmovie_id}>
                                <img src={`https://image.tmdb.org/t/p/w600_and_h900_bestv2${movie.movie_image}`} alt={movie.movie_title} />
                                <div className="movie-title">
                                    <h2>{movie.movie_title}</h2>
                                
                                    <div className="group-reviews">
                                    {
                                        allReviews.length > 0 && (
                                            <div className="group-reviews">
                                            {allReviews.map((review) => (
                                                review.groupmoviereview_movie_id === movie.movie_id && (
                                                    <div className="review-item" key={review.review_id}>
                                                <MdOutlineMessage className="addIcon" />
                                                <p>{review.groupmoviereview_review}</p>
                                                <p><span>Created by:{review.groupmoviereview_user?.split('@',1)}</span></p>
                                                </div>
                                                )
                                            ))}
                                            </div>
                                        )
                                    }
                                        <div className="review-item-submit">
                                            <input onChange={(e)=>setReview(e.target.value)} type="text" name="moviereview" placeholder="Share your thoughts about this movie..." id="" />
                                            <button onClick={(e)=>handleReviewSubmit(e, movie.movie_id)}><FaPlus className="addIcon" /></button>
                                        </div>
                                        
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p>No movies available for this group.</p>
                    )}
                </div>

                <div className="group-members">
                    <h2>Group Members</h2>
                    <ul>
                        {members.map((member) => (
                            <li key={member.groupmember_id}>
                                <FaUserNinja className="userIcon" />
                                ID: {member.groupmember_users_id}, Status: {member.groupmember_status}
                                {/* Only the group owner can remove other members */}
                                {user &&
                                    user.users_id === group.group_owner_id &&
                                    member.groupmember_users_id !== group.group_owner_id && (
                                        <button
                                            className="delete-button"
                                            onClick={() => handleRemoveMember(member.groupmember_users_id)}
                                        >
                                            Remove
                                        </button>
                                    )}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}

export default GroupPage;
