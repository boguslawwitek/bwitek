import { Mail, Terminal } from 'lucide-react';
import { SiDiscord, SiGithub } from '@icons-pack/react-simple-icons';

export default function TopBar() {
  return (
    <div className="bg-black py-4 relative top-0 left-0 w-full select-none shadow-lg border-b border-gray-800 font-hack">
        <div className='max-w-screen-lg m-auto px-6 md:px-24'>
            <div className='flex items-center justify-between'>
                <div className='flex items-center gap-2'>
                    <div>
                        <Terminal size={32} className="text-red-400" />
                    </div>
                    <div className="text-xl text-gray-300">BWitek.dev</div>
                </div>

                <div className='flex items-center gap-4'>
                    <a href='mailto:contact@bwitek.dev' className='focus:outline focus:outline-1 focus:outline-offset-1 focus:outline-red-400 rounded hover:text-red-400' tabIndex={5}><Mail size={32} className='text-gray-400 hover:text-red-400 transition-colors' /></a>
                    <a href='https://discord.com/users/250280270828273665' className='focus:outline focus:outline-1 focus:outline-offset-1 focus:outline-red-400 rounded hover:text-red-400' target='_blank' tabIndex={6}><SiDiscord size={32} className='text-gray-400 hover:text-red-400 transition-colors' /></a>
                    <a href='https://github.com/boguslawwitek' className='focus:outline focus:outline-1 focus:outline-offset-1 focus:outline-red-400 rounded hover:text-red-400' target='_blank' tabIndex={7}><SiGithub size={32} className='text-gray-400 hover:text-red-400 transition-colors' /></a>
                </div>
            </div>
        </div>
    </div>
  );
}