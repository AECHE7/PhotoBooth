import { Link } from 'react-router-dom';
import { Camera, Download, Star, Sparkles, Users, Image as ImageIcon, Smile, Layers } from 'lucide-react';

export const Home = () => {
  return (
      <div className="bg-black text-white min-h-screen">
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 to-black pointer-events-none" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20 relative z-10 text-center">
            <h1
              className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400"
            >
              Photo Booth Web
            </h1>
            <p
              className="text-xl md:text-2xl text-gray-300 mb-10 max-w-3xl mx-auto"
            >
              Online Camera & Photo Strip Maker. Capture 4 moments, add aesthetic filters, and create your Life4Cuts style strip instantly.
            </p>

            <div
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <Link to="/booth">
                <button
                  className="px-8 py-4 bg-white text-black rounded-full font-bold text-lg shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)] transition-shadow flex items-center gap-2"
                >
                  <Camera size={24} />
                  Start Photo Booth
                </button>
              </Link>
              <Link to="/gallery">
                <button
                  className="px-8 py-4 bg-gray-800 text-white rounded-full font-bold text-lg hover:bg-gray-700 transition-colors"
                >
                  View Gallery
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="py-20 bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-16">How it Works</h2>
            <div className="grid md:grid-cols-3 gap-12">
              {[
                {
                  icon: <Camera size={48} className="text-blue-400" />,
                  title: "1. Take 4 Pictures",
                  desc: "Automatic 4-shot sequence with a 3-second interval between each snap."
                },
                {
                  icon: <Sparkles size={48} className="text-purple-400" />,
                  title: "2. Decorate",
                  desc: "Choose layouts, apply vintage filters, pick frame colors, and add fun stickers."
                },
                {
                  icon: <Download size={48} className="text-pink-400" />,
                  title: "3. Download & Share",
                  desc: "Get your high-res photo strip instantly via download or QR code."
                }
              ].map((step, i) => (
                <div
                  key={i}
                  className="bg-black p-8 rounded-2xl border border-gray-800 text-center hover:border-gray-700 transition-colors"
                >
                  <div className="bg-gray-800 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                    {step.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-4">{step.title}</h3>
                  <p className="text-gray-400">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Why Use */}
        <div className="py-20 bg-black">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-8">Why use this Photo Booth?</h2>
                <div className="space-y-6">
                  {[
                    { title: "Comfort at Home", desc: "No public awkwardness. Pose freely in your own space." },
                    { title: "Unlimited Retakes", desc: "Take as many photos as you want until they are perfect." },
                    { title: "100% Free", desc: "No coins, no queues, just pure fun." }
                  ].map((item, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="mt-1">
                        <Star className="text-yellow-400 fill-yellow-400" size={20} />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">{item.title}</h3>
                        <p className="text-gray-400">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-2xl blur-2xl opacity-20" />
                <div className="relative bg-gray-900 rounded-2xl p-8 border border-gray-800 aspect-square flex items-center justify-center">
                    <div className="grid grid-cols-2 gap-4 w-full h-full opacity-50">
                        <div className="bg-gray-800 rounded-lg animate-pulse delay-75"></div>
                        <div className="bg-gray-800 rounded-lg animate-pulse delay-150"></div>
                        <div className="bg-gray-800 rounded-lg animate-pulse delay-300"></div>
                        <div className="bg-gray-800 rounded-lg animate-pulse"></div>
                    </div>
                    <div className="absolute text-center">
                        <h4 className="text-2xl font-bold mb-2">Life4Cuts Style</h4>
                        <p className="text-gray-400">Vertical strips & 2x2 grids</p>
                    </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews */}
        <div className="py-20 bg-gray-900">
           <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-16">User Reviews</h2>
            <div className="grid md:grid-cols-3 gap-8">
                {[
                    { name: "Sarah K.", role: "Student", text: "I love collecting photo strips but hate the lines at the mall. This is perfect for quick snaps with friends!" },
                    { name: "Mike R.", role: "Photographer", text: "Surprisingly good quality. The vintage filters give it that authentic film look." },
                    { name: "Jessica T.", role: "Introvert", text: "Finally, I can take silly photos without anyone watching. The stickers are so cute!" }
                ].map((review, i) => (
                    <div
                        key={i}
                        className="bg-black p-6 rounded-xl border border-gray-800"
                    >
                        <div className="flex gap-1 mb-4">
                            {[...Array(5)].map((_, j) => <Star key={j} size={16} className="text-yellow-400 fill-yellow-400" />)}
                        </div>
                        <p className="text-gray-300 mb-6 italic">"{review.text}"</p>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center font-bold">
                                {review.name[0]}
                            </div>
                            <div>
                                <h4 className="font-bold">{review.name}</h4>
                                <p className="text-xs text-gray-500">{review.role}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
           </div>
        </div>

        {/* More Tools */}
        <div className="py-20 bg-black">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-16">More Tools</h2>
            <div className="grid md:grid-cols-4 gap-6">
                {[
                    { icon: <Smile size={32} />, title: "Face Shape Analyzer", desc: "Find your perfect hairstyle." },
                    { icon: <ImageIcon size={32} />, title: "Cartoon Converter", desc: "Turn photos into art." },
                    { icon: <Layers size={32} />, title: "Collage Maker", desc: "Combine multiple memories." },
                    { icon: <Users size={32} />, title: "AI Face Swap", desc: "Fun face swapping magic." }
                ].map((tool, i) => (
                    <a href="#" key={i} className="group block bg-gray-900 p-6 rounded-xl border border-gray-800 hover:border-blue-500 transition-colors">
                        <div className="mb-4 text-gray-400 group-hover:text-blue-400 transition-colors">
                            {tool.icon}
                        </div>
                        <h3 className="font-bold text-lg mb-2">{tool.title}</h3>
                        <p className="text-sm text-gray-500 mb-4">{tool.desc}</p>
                        <span className="text-blue-400 text-sm font-bold group-hover:underline">Try it now →</span>
                    </a>
                ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="border-t border-gray-800 py-12 bg-black text-center text-gray-500 text-sm">
            <p className="mb-4">© 2026 Photo Booth Web. All rights reserved.</p>
            <div className="flex justify-center gap-6">
                <a href="#" className="hover:text-white">Privacy Policy</a>
                <a href="#" className="hover:text-white">Terms of Service</a>
                <a href="#" className="hover:text-white">Contact</a>
            </div>
        </footer>
      </div>
  );
};
