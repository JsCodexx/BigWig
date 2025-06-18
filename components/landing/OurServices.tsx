"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/app/lib/supabase/Clientsupabase";

interface Service {
  id: string;
  title: string;
  image_url: string;
}

interface ServiceType {
  id: string;
  name: string;
  services: Service[];
}

const OurServices = () => {
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase.from("service_types").select(`
            id,
            name,
            services (
              id,
              title,
              image_url
            )
          `);

      if (error) {
        console.error("Error fetching service types:", error.message);
        return;
      }

      if (data) {
        setServiceTypes(data as ServiceType[]);
      }
    };

    fetchData();
  }, []);

  if (!serviceTypes.length)
    return <p className="text-center py-10">Loading...</p>;

  return (
    <section className="py-16 px-6 bg-gray-100 dark:bg-gray-900 text-center">
      <div className="max-w-6xl mx-auto">
        <motion.h2
          className="text-4xl font-bold text-red-500"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          Our Services
        </motion.h2>

        <motion.p
          className="mt-4 text-lg text-gray-700 dark:text-gray-300 max-w-3xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
        >
          Choose from a variety of high-impact advertising solutions tailored to
          your brand’s needs.
        </motion.p>

        {/* Tabs */}
        <div className="mt-10 border-b border-gray-300 dark:border-gray-700">
          <div className="flex justify-center overflow-x-auto gap-6">
            {serviceTypes.map((type, index) => (
              <button
                key={type.id}
                onClick={() => setActiveTab(index)}
                className={`relative px-6 py-3 text-lg font-semibold transition-all duration-300 whitespace-nowrap 
                  ${
                    activeTab === index
                      ? "text-red-500"
                      : "text-gray-600 dark:text-gray-400"
                  }`}
              >
                {type.name}
                {activeTab === index && (
                  <motion.div
                    layoutId="underline"
                    className="absolute left-0 bottom-0 w-full h-1 bg-red-500 rounded-full"
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Services */}
        <div className="mt-12">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.5 }}
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8"
            >
              {serviceTypes[activeTab]?.services?.map((service, idx) => (
                <motion.div
                  key={service.id}
                  className="relative h-48 rounded-lg overflow-hidden shadow-lg group"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                >
                  <div className="relative w-full h-full">
                    <Image
                      src={service.image_url}
                      alt={service.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
                      <span className="text-white text-xl font-semibold">
                        {service.title}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};

export default OurServices;
