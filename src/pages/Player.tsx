import { useState, useEffect, useRef } from 'react';

import {
  useNavigate,
  useParams,
} from 'react-router-dom';

import {
  ArrowLeft,
  Maximize,
  List,
  Check,
} from 'lucide-react';

import { invoke } from '@tauri-apps/api/core';

interface StreamResult {
  source_name: string;
  url: string;
  quality: string;
  is_m3u8: boolean;
  referer?: string;
  origin?: string;
}

export default function Player() {

  const navigate = useNavigate();

  const { id, type } = useParams<{
    id: string;
    type: string;
  }>();

  const playerRef =
    useRef<HTMLDivElement>(null);

  const controlsTimeoutRef =
    useRef<ReturnType<typeof setTimeout> | null>(
      null
    );

  const [streams, setStreams] =
    useState<StreamResult[]>([]);

  const [selectedStream, setSelectedStream] =
    useState<StreamResult | null>(null);

  const [streamUrl, setStreamUrl] =
    useState('');

  const [showControls, setShowControls] =
    useState(true);

  const [isLoading, setIsLoading] =
    useState(true);

  const [errorMsg, setErrorMsg] =
    useState('');

  const [activeMenu, setActiveMenu] =
    useState<'none' | 'source'>('none');

  // =====================================================
  // LOAD STREAMS
  // =====================================================

  useEffect(() => {

    const initializeStream = async () => {

      if (!id) {

        setErrorMsg(
          'Invalid media id'
        );

        return;
      }

      try {

        setIsLoading(true);

        setErrorMsg('');

        console.log(
          'Fetching streams:',
          {
            tmdbId: id,
            mediaType: type,
          }
        );

        const scrapedData =
          await invoke<StreamResult[]>(
            'search_streams',
            {
              tmdbId: id,
              mediaType:
                type || 'movie',
            }
          );

        console.log(
          'Rust Streams:',
          scrapedData
        );

        if (
          !scrapedData ||
          scrapedData.length === 0
        ) {

          setErrorMsg(
            'No streams found'
          );

          return;
        }

        setStreams(scrapedData);

        const bestStream =
          scrapedData[0];

        setSelectedStream(
          bestStream
        );

        setStreamUrl(
          bestStream.url
        );

      } catch (error) {

        console.error(
          'Failed to fetch streams:',
          error
        );

        setErrorMsg(
          String(error)
        );

      } finally {

        setIsLoading(false);
      }
    };

    initializeStream();

  }, [id, type]);

  // =====================================================
  // AUTO HIDE CONTROLS
  // =====================================================

  const handleActivity = () => {

    setShowControls(true);

    if (
      controlsTimeoutRef.current
    ) {

      clearTimeout(
        controlsTimeoutRef.current
      );
    }

    controlsTimeoutRef.current =
      setTimeout(() => {

        setShowControls(false);

      }, 3000);
  };

  useEffect(() => {

    window.addEventListener(
      'mousemove',
      handleActivity
    );

    return () => {

      window.removeEventListener(
        'mousemove',
        handleActivity
      );

      if (
        controlsTimeoutRef.current
      ) {

        clearTimeout(
          controlsTimeoutRef.current
        );
      }
    };

  }, []);

  // =====================================================
  // UI
  // =====================================================

  return (

    <div
      ref={playerRef}
      className="
        relative
        h-screen
        w-screen
        overflow-hidden
        bg-black
      "
    >

      {/* PLAYER */}

      {streamUrl && (

        <iframe
  src={streamUrl}
  className="
    absolute
    inset-0
    h-full
    w-full
    border-0
  "
  allow="autoplay; fullscreen"
></iframe>
      )}

      {/* LOADING */}

      {isLoading && (

        <div
          className="
            absolute
            inset-0
            z-50
            flex
            items-center
            justify-center
            bg-black
          "
        >

          <p
            className="
              text-lg
              text-white
            "
          >
            Loading Stream...
          </p>

        </div>
      )}

      {/* ERROR */}

      {errorMsg && !isLoading && (

        <div
          className="
            absolute
            inset-0
            z-50
            flex
            flex-col
            items-center
            justify-center
            bg-black
          "
        >

          <p
            className="
              text-xl
              text-red-500
            "
          >
            {errorMsg}
          </p>

          <button
            onClick={() => navigate(-1)}
            className="
              mt-6
              rounded
              bg-red-600
              px-6
              py-2
              text-white
            "
          >
            Go Back
          </button>

        </div>
      )}

      {/* CONTROLS */}

      <div
        className={`
          absolute
          inset-0
          z-40
          flex
          flex-col
          justify-between
          p-6
          transition-opacity
          duration-300
          pointer-events-none

          ${
            showControls
              ? 'opacity-100'
              : 'opacity-0'
          }
        `}
      >

        {/* TOP */}

        <div
          className="
            flex
            items-center
            justify-between
            pointer-events-auto
          "
        >

          <button
            onClick={() => navigate(-1)}
            className="
              rounded-full
              bg-black/50
              p-3
              text-white
              backdrop-blur-md
            "
          >

            <ArrowLeft size={24} />

          </button>

          <div
            className="
              text-right
              text-white
            "
          >

            <h1
              className="
                text-lg
                font-bold
              "
            >
              {
                selectedStream
                  ?.source_name ||
                'Loading'
              }
            </h1>

            <p
              className="
                text-sm
                opacity-70
              "
            >
              {
                selectedStream
                  ?.quality
              }
            </p>

          </div>

        </div>

        {/* BOTTOM */}

        <div
          className="
            flex
            items-center
            justify-end
            gap-4
            pointer-events-auto
          "
        >

          {/* SOURCES */}

          <button
            onClick={() =>
              setActiveMenu(
                activeMenu ===
                'source'
                  ? 'none'
                  : 'source'
              )
            }
            className="
              flex
              items-center
              gap-2
              rounded-lg
              bg-black/50
              px-4
              py-3
              text-white
              backdrop-blur-md
            "
          >

            <List size={18} />

            Sources

          </button>

          {/* FULLSCREEN */}

          <button
            onClick={() => {

              if (
                !document.fullscreenElement
              ) {

                playerRef.current
                  ?.requestFullscreen();

              } else {

                document.exitFullscreen();
              }
            }}
            className="
              rounded-lg
              bg-black/50
              p-3
              text-white
              backdrop-blur-md
            "
          >

            <Maximize size={20} />

          </button>

        </div>

      </div>

      {/* SOURCE MENU */}

      {activeMenu === 'source' && (

        <div
          className="
            absolute
            inset-0
            z-50
            bg-black/95
            p-10
          "
        >

          <div
            className="
              flex
              flex-col
              gap-4
            "
          >

            {streams.map(
              (stream, index) => (

                <button
                  key={index}
                  onClick={() => {

                    setSelectedStream(
                      stream
                    );

                    setStreamUrl(
                      stream.url
                    );

                    setActiveMenu(
                      'none'
                    );
                  }}
                  className={`
                    flex
                    items-center
                    gap-4
                    rounded-xl
                    p-4
                    text-left
                    transition-all

                    ${
                      selectedStream?.url ===
                      stream.url
                        ? 'bg-white/10 text-white'
                        : 'text-gray-400 hover:bg-white/5'
                    }
                  `}
                >

                  {
                    selectedStream?.url ===
                    stream.url && (

                      <Check
                        size={16}
                        className="
                          text-red-500
                        "
                      />
                    )
                  }

                  <div
                    className="
                      flex
                      flex-col
                    "
                  >

                    <span
                      className="
                        font-bold
                      "
                    >
                      {stream.source_name}
                    </span>

                    <span
                      className="
                        text-sm
                        opacity-70
                      "
                    >
                      {stream.quality}
                    </span>

                  </div>

                </button>
              )
            )}

          </div>

        </div>
      )}

    </div>
  );
}