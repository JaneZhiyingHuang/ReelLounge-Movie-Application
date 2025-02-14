import React, { useEffect, useState } from 'react';
import './Header.css';
import { FaUserLarge } from "react-icons/fa6";
import { FaSearch } from "react-icons/fa";
import { IoMdNotificationsOutline } from "react-icons/io";
import axios from "axios";
import { BiSolidCoffee } from 'react-icons/bi';
import XMLParser from 'react-xml-parser';
import { useNavigate } from 'react-router-dom';
import { FaBars } from "react-icons/fa";


function Header( { setSelectedMovie }) {

    const navigate = useNavigate();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [showtimes, setShowtimes] = useState(new Set());
    const [isTyping, setIsTyping] = useState(false);
    const [showResults, setShowResults] = useState(false);  // Controls the visibility of search results
    const url = process.env.REACT_APP_API_URL
    const [burgerMenuIsOpen, setBurgerMenuIsOpen] = useState(false);

    const toggleBurgerMenu = () => {
        setBurgerMenuIsOpen(!burgerMenuIsOpen);
    };


    const handleMovieClick = (movie) => {
        setSelectedMovie(movie);  // Set the selected movie
        navigate(`/MoviePage/${movie.id}`);  // Navigate to the MoviePage with movieId in the URL
        setQuery('');
    };

    // Function to fetch and parse showtimes from Finnkino
    const fetchShowtimes = async () => {
        try {
            const response = await axios.get("https://www.finnkino.fi/xml/Schedule");
            const xml = new XMLParser().parseFromString(response.data);
            const showtimeMovies = xml.getElementsByTagName('Title').map(node => node.value);
            setShowtimes(new Set(showtimeMovies));
        } catch (error) {
            console.error("Error fetching showtimes:", error);
        }
    };

    useEffect(() => {
        fetchShowtimes();
    }, []);

    useEffect(() => {
        if (query.length === 0) {
            setResults([]);
            setIsTyping(false); 
            setShowResults(false);  // Hide results when query is empty
            return;
        }

        const delayDebounceFn = setTimeout(() => {
            if (query) {
                // Fetch movies from TMDB
                const fetchMovies = async () => {
                    try {
                        const response = await axios.get(url + "/movie/search/", {
                            params: {
                                query
                            },
                        });
                        setResults(response.data);
                        setShowResults(true);  // Show search results
                    } catch (error) {
                        console.error('Error fetching movies:', error);
                    }
                };
                fetchMovies();
            }
            setIsTyping(false);
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [query]);

    const handleInputChange = (event) => {
        setQuery(event.target.value);
        setIsTyping(true);
    };
    // Handle pressing Enter to navigate to search page with query
    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && query.length > 0) {
            navigate(`/search?query=${query}`);
        }
    };

    // Hide search results when mouse leaves the result area
    const handleMouseLeave = () => {
        setShowResults(false);
    };

    // Show search results when mouse enters the result area
    const handleMouseEnter = () => {
        setShowResults(true);
    };

    const user = JSON.parse(sessionStorage.getItem('user'));
    const User = user ? user : { users_email: 'Login' };

    return (
        <div className='header'>
            <div className='left-header'>
                <div className='logo' onClick={(e) => 
                    {e.preventDefault();
                    window.location.href = '/';}
                }>
                    <BiSolidCoffee className='logoIcon'/>
                    <h1>ReelLounge</h1>
                </div>
                <nav>
                    <ul>
                     <li onClick={
                            (e) => {
                                e.preventDefault();
                                navigate('/user');
                            }}>
                              Favorites
                        </li>
                        <li onClick={
                            (e) => {
                                e.preventDefault();
                                navigate('/Reviews');
                            }}>
                            Reviews
                        </li>
                        <li onClick={
                            (e) => {
                                e.preventDefault();
                                navigate('/Showtimes');
                            }}>
                            Showtimes
                        </li>
                    </ul>
                </nav>
            </div>

            <div className='search'>
                <div className='input-container'>
                    <FaSearch className="searchIcon" />
                    <input
                        type='text'
                        placeholder='Search for a movie, tv show, person...'
                        value={query}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown} 
                    />
                </div>
            </div>

            <div className='search-results' 
                onMouseEnter={handleMouseEnter} 
                onMouseLeave={handleMouseLeave}  
            >
                {isTyping && query && <p>Searching...</p>}
                {showResults&&results.map((movie) => (
                    <div 
                    key={movie.id} 
                    className='movie-item'
                    onClick={() => handleMovieClick(movie)}
                    >
                        <p>
                            {movie.title} {showtimes.has(movie.title) && <span className='showtime'>(Showtime)</span>}
                        </p>
                    </div>
                ))}
            </div>

            <div className='profile' >
                <IoMdNotificationsOutline className='notifIcon' onClick={() => {
                const user = sessionStorage.getItem('user'); 
                if (user) {
                    navigate('/notifications'); 
                } else {
                    navigate('/login'); 
                }
            }} />
            <div className='profile' onClick={() => {
                    const user = sessionStorage.getItem('user'); 
                    if (user) {
                        navigate('/user'); 
                    } else {
                        navigate('/login'); 
                    }
                }}>
                <FaUserLarge className='userIcon' />
                    <span>
                        {sessionStorage.getItem('user') ? user.users_email.split('@')[0]  : 'Login'}
                    </span>
            </div>
               
            </div>
            <div className="burger-Icon" onClick={toggleBurgerMenu}>
                <FaBars className='barIcon'/>
            </div>

            {burgerMenuIsOpen && (
                <div className="burger-menu">
                    <div className='burger-items'>
                    <ul>
                        <li>
                            <div className='profile-burger' >
                                
                            <div className='profile-burger' onClick={() => {
                                    const user = sessionStorage.getItem('user'); 
                                    if (user) {
                                        navigate('/user'); 
                                    } else {
                                        navigate('/login'); 
                                    }
                                }}>
                                <FaUserLarge className='userIcon' />
                                    <span>
                                        {sessionStorage.getItem('user') ? user.users_email.split('@')[0]  : 'Login'}
                                    </span>
                            </div>
                            
                            </div>
                        </li>
                        <div className='search-burger'>
                            <div className='input-container-burger'>
                                <FaSearch className="searchIcon" />
                                <input
                                    type='text'
                                    placeholder='Search for a movie, tv show, person...'
                                    value={query}
                                    onChange={handleInputChange}
                                    onKeyDown={handleKeyDown} 
                                />
                            </div>
                        </div>

                        <li onClick={() => {
                                const user = sessionStorage.getItem('user'); 
                                if (user) {
                                    navigate('/notifications'); 
                                } else {
                                    navigate('/login'); 
                                }
                            }}>
                            Notifications
                        </li>
                        <li onClick={
                            (e) => {
                                e.preventDefault();
                                navigate('/user');}
                            }>Favorites</li>
                            <li onClick={
                            (e) => {
                                e.preventDefault();
                                navigate('/Reviews');}
                            }>Reviews</li>
                            <li onClick={
                                (e) => {
                                    e.preventDefault();
                                    navigate("/showtimes");}
                            }>Showtimes</li>
                        </ul>
                    </div>
                    
                </div>
            )}
        </div>
    );
}

export default Header;
