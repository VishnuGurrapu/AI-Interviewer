import React, { useCallback } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Upload, FileText, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Props {
  onUpload: (file: File) => void;
}

const ResumeUpload: React.FC<Props> = ({ onUpload }) => {
  const { toast } = useToast();

  const handleFileUpload = useCallback((file: File) => {
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF or DOCX file.",
        variant: "destructive",
      });
      return;
    }

    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: "Please upload a file smaller than 10MB.",
        variant: "destructive",
      });
      return;
    }

    onUpload(file);
    toast({
      title: "Resume uploaded successfully!",
      description: "Your resume has been processed and information extracted.",
    });
  }, [onUpload, toast]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  }, [handleFileUpload]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  }, [handleFileUpload]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        className="p-8 border-2 border-dashed border-glass-border glass-panel-hover cursor-pointer"
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => document.getElementById('resume-upload')?.click()}
      >
        <div className="text-center space-y-4">
          <motion.div
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="flex justify-center"
          >
            <div className="p-4 glass-panel rounded-full">
              <Upload className="w-8 h-8 text-primary" />
            </div>
          </motion.div>
          
          <div>
            <h3 className="text-lg font-semibold mb-2">Upload Your Resume</h3>
            <p className="text-muted-foreground mb-4">
              Drag and drop your resume here, or click to browse
            </p>
            <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
              <FileText className="w-4 h-4" />
              Supports PDF and DOCX files (max 10MB)
            </p>
          </div>

          <Button variant="gradient" size="lg">
            <Upload className="w-4 h-4 mr-2" />
            Choose File
          </Button>

          <input
            id="resume-upload"
            type="file"
            accept=".pdf,.docx"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      </Card>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-4 p-4 glass-panel rounded-lg"
      >
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-primary mt-0.5" />
          <div className="text-sm">
            <p className="font-medium mb-1">What happens next?</p>
            <ul className="text-muted-foreground space-y-1">
              <li>• We'll extract your name, email, and phone number</li>
              <li>• Missing information will be collected via chat</li>
              <li>• Your interview will begin once we have all details</li>
            </ul>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ResumeUpload;