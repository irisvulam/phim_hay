'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import { Film } from '@/lib/api';
import Link from 'next/link';

interface HeroSliderProps {
  films: Film[];
}

export default function HeroSlider({ films }: HeroSliderProps) {
  if (!films || films.length === 0) return null;

  return (
    <div className="relative w-full max-w-screen-2xl mx-auto md:mt-4 md:px-4">
      <Swiper
        modules={[Autoplay, Pagination, Navigation]}
        spaceBetween={0}
        slidesPerView={1}
        pagination={{ clickable: true }}
        navigation={{
          nextEl: '.swiper-button-next',
          prevEl: '.swiper-button-prev',
        }}
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        loop={true}
        className="md:rounded-2xl overflow-hidden shadow-2xl h-[350px] md:h-[500px]"
      >
        {films.map((film) => (
          <SwiperSlide key={film.slug}>
            <div className="relative w-full h-full flex items-end">
              <img 
                src={film.poster_url || film.thumb_url} 
                alt={film.name} 
                className="absolute inset-0 w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0f111a] via-[#191b24]/80 to-transparent md:bg-gradient-to-r md:from-[#0f111a] md:via-[#191b24]/80 md:to-transparent"></div>
              
              <div className="relative z-10 p-6 md:p-14 w-full md:w-3/4 lg:w-1/2">
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="tag-model">{film.quality}</span>
                  <span className="tag-classic">{film.language}</span>
                  <span className="tag-topic">{film.category?.[0]?.name}</span>
                  <span className="tag-classic">{film.time}</span>
                </div>
                <h2 className="text-3xl md:text-5xl font-bold text-white mb-2 leading-tight line-clamp-2 md:line-clamp-1 text-shadow">
                  {film.name}
                </h2>
                <h3 className="text-sm md:text-xl text-gray-300 mb-4 line-clamp-1 font-medium text-shadow-sm">
                  {film.original_name}
                </h3>
                <p className="text-gray-400 text-sm md:text-base hidden md:-webkit-box line-clamp-3 mb-8 max-w-2xl">
                  {film.description?.replace(/<[^>]+>/g, '')}
                </p>
                <div className="flex gap-4">
                  <Link href={`/${film.slug}`} className="btn btn-xl btn-rounded button-play md:px-8">
                    <span className="text-xl">▶</span> Xem Ngay
                  </Link>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
        {/* Custom Navigation */}
        <div className="swiper-button-prev !text-white/50 hover:!text-white after:!text-2xl !left-4 hidden md:flex"></div>
        <div className="swiper-button-next !text-white/50 hover:!text-white after:!text-2xl !right-4 hidden md:flex"></div>
      </Swiper>
    </div>
  );
}
