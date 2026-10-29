import { readFileSync, writeFileSync } from 'fs';

const filePath = "C:\\Users\\timur\\OneDrive\\Рабочий стол\\opencode\\client\\src\\app\\poll\\[id]\\page.tsx";

try {
  const content = readFileSync(filePath, 'utf8');
  
  // Replace the dependency array line - using a more specific pattern
  const newContent = content.replace(/(\s*)},\s*\[params\.id\]\);/g, '$1}, [params.id, fetchPoll]);');
  
  writeFileSync(filePath, newContent);
  console.log('File updated successfully!');
} catch (error) {
  console.error('Error updating file:', error.message);
}
