'use client';

import React, { useState } from 'react';
import { FaPlay } from 'react-icons/fa';

const TopVideos = () => {
  // Dummy video data - using educational YouTube videos for demo
  const videos = [
    {
      id: 1,
      title: "महाराष्ट्राचा इतिहास आणि संस्कृती",
      thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
      videoId: "dQw4w9WgXcQ",
      duration: "5:30",
      views: "1.2M",
      date: "2 दिवसांपूर्वी"
    },
    {
      id: 2,
      title: "मराठी साहित्याचा विकास आणि महत्त्व",
      thumbnail: "https://img.youtube.com/vi/jNQXAC9IVRw/maxresdefault.jpg",
      videoId: "jNQXAC9IVRw",
      duration: "8:15",
      views: "850K",
      date: "3 दिवसांपूर्वी"
    },
    {
      id: 3,
      title: "भारताचा आर्थिक विकास - एक विहंगम दृष्टी",
      thumbnail: "https://img.youtube.com/vi/9bZkp7q19f0/maxresdefault.jpg",
      videoId: "9bZkp7q19f0",
      duration: "12:45",
      views: "2.1M",
      date: "5 दिवसांपूर्वी"
    },
    {
      id: 4,
      title: "युवा आणि करिअर - संधी आणि आव्हाने",
      thumbnail: "https://img.youtube.com/vi/kJQP7kiw5Fk/maxresdefault.jpg",
      videoId: "kJQP7kiw5Fk",
      duration: "10:20",
      views: "1.5M",
      date: "1 आठवड्यापूर्वी"
    },
    {
      id: 5,
      title: "आरोग्य आणि आहार - आधुनिक दृष्टिकोन",
      thumbnail: "https://img.youtube.com/vi/fJ9rUzIMcZQ/maxresdefault.jpg",
      videoId: "fJ9rUzIMcZQ",
      duration: "7:30",
      views: "950K",
      date: "1 आठवड्यापूर्वी"
    }
  ];

  const [selectedVideo, setSelectedVideo] = useState(videos[0]);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleVideoSelect = (video) => {
    setSelectedVideo(video);
    setIsPlaying(true);
  };

  return (
    <section className="bg-cleanWhite py-8 border-t border-b border-subtleGray my-8">
      {/* Section Header */}
      <div className="flex items-center mb-6">
        <div className="bg-gradient-to-r from-newsRed to-editorialBlue text-cleanWhite px-3 py-1 rounded mr-3 font-bold text-sm">
          NS
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-deepCharcoal">
          शीर्ष व्हिडिओ
        </h2>
      </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Video Player - Left Side */}
          <div className="lg:col-span-2">
            <div className="relative bg-black rounded-lg overflow-hidden" style={{ paddingBottom: '56.25%' }}>
              {isPlaying ? (
                <iframe
                  className="absolute top-0 left-0 w-full h-full"
                  src={`https://www.youtube.com/embed/${selectedVideo.videoId}?autoplay=1`}
                  title={selectedVideo.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              ) : (
                <div className="absolute top-0 left-0 w-full h-full">
                  <img
                    src={selectedVideo.thumbnail}
                    alt={selectedVideo.title}
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => setIsPlaying(true)}
                    className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 hover:bg-opacity-40 transition-all group"
                  >
                    <div className="bg-white bg-opacity-90 rounded-full p-4 group-hover:scale-110 transition-transform">
                      <FaPlay className="w-8 h-8 text-gray-900 ml-1" />
                    </div>
                  </button>
                  {/* Video Overlay Info */}
                  <div className="absolute top-2 left-2">
                    <span className="bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                      NS
                    </span>
                  </div>
                </div>
              )}
            </div>
            <h3 className="text-lg font-bold text-deepCharcoal mt-4 line-clamp-2">
              {selectedVideo.title}
            </h3>
            <div className="flex items-center space-x-4 text-sm text-slateBody mt-2">
              <span>{selectedVideo.views} दृश्ये</span>
              <span>•</span>
              <span>{selectedVideo.date}</span>
            </div>
          </div>

          {/* Video List - Right Side */}
          <div className="lg:col-span-1">
            <div className="space-y-4 max-h-[600px] overflow-y-auto">
              {videos.map((video) => (
                <div
                  key={video.id}
                  onClick={() => handleVideoSelect(video)}
                  className={`flex space-x-3 cursor-pointer group p-2 rounded transition-colors ${
                    selectedVideo.id === video.id
                      ? 'bg-newsRed/5 border-l-4 border-newsRed'
                      : 'hover:bg-subtleGray'
                  }`}
                >
                  {/* Thumbnail */}
                  <div className="relative flex-shrink-0 w-32 h-20 bg-subtleGray rounded overflow-hidden">
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    {/* Play Button Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 group-hover:bg-opacity-40 transition-all">
                      <div className="bg-white bg-opacity-90 rounded-full p-1">
                        <FaPlay className="w-3 h-3 text-gray-900 ml-0.5" />
                      </div>
                    </div>
                    {/* Duration Badge */}
                    <div className="absolute bottom-1 right-1 bg-black bg-opacity-70 text-cleanWhite text-xs px-1 rounded">
                      {video.duration}
                    </div>
                    {/* NS Badge */}
                    <div className="absolute top-1 left-1">
                      <span className="bg-gradient-to-r from-newsRed to-editorialBlue text-cleanWhite text-xs px-1 py-0.5 rounded font-bold">
                        NS
                      </span>
                    </div>
                  </div>

                  {/* Video Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className={`text-sm font-semibold line-clamp-2 mb-1 ${
                      selectedVideo.id === video.id
                        ? 'text-newsRed'
                        : 'text-deepCharcoal group-hover:text-newsRed'
                    } transition-colors`}>
                      {video.title}
                    </h4>
                    <div className="flex items-center space-x-2 text-xs text-metaGray">
                      <span>{video.views}</span>
                      <span>•</span>
                      <span>{video.date}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
    </section>
  );
};

export default TopVideos;

