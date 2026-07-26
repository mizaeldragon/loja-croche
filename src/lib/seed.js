// Dados iniciais (seed) do ateliê — usados para popular o localStorage na primeira execução.
// Imagens locais de crochê em /public/images, alinhadas a cada título.

const local = (path) => `/images/${path}`

const ph = (w, h, bg, fg, text) =>
  `https://placehold.co/${w}x${h}/${bg}/${fg}?font=playfair-display&text=${encodeURIComponent(text)}`

export const PALETTE_BG = ['EFE3CE', 'E4D4B8', 'D6C09E', 'F5EEE1', 'D7AE7C']
export const PALETTE_FG = ['6B4F3D', '523A2B', '3D2B20']

export const seedCategories = [
  {
    id: 'cat_roupas',
    name: 'Roupas',
    slug: 'roupas',
    description: 'Blusas, tops, vestidos e cardigans em crochê fino, feitos sob medida.',
    image: local('categorias/roupas.jpg'),
    order: 1,
  },
  {
    id: 'cat_acessorios',
    name: 'Acessórios',
    slug: 'acessorios',
    description: 'Bolsas, chapéus, bandanas e cintos que finalizam qualquer look.',
    image: local('categorias/acessorios.jpg'),
    order: 2,
  },
  {
    id: 'cat_decoracao',
    name: 'Decoração',
    slug: 'decoracao',
    description: 'Almofadas, mandalas e peças que aquecem qualquer ambiente.',
    image: local('categorias/decoracao.jpg'),
    order: 3,
  },
  {
    id: 'cat_enxovais',
    name: 'Enxovais',
    slug: 'enxovais',
    description: 'Mantas e conjuntos delicados para a chegada do bebê.',
    image: local('categorias/enxovais.jpg'),
    order: 4,
  },
  {
    id: 'cat_personalizados',
    name: 'Personalizados',
    slug: 'personalizados',
    description: 'Peças exclusivas, criadas a partir da sua ideia e medidas.',
    image: local('categorias/personalizados.jpg'),
    order: 5,
  },
  {
    id: 'cat_presentes',
    name: 'Presentes',
    slug: 'presentes',
    description: 'Kits e miniaturas perfeitas para presentear com afeto.',
    image: local('categorias/presentes.jpg'),
    order: 6,
  },
]

let _seq = 1
function prod({
  name,
  category,
  price,
  promoPrice = null,
  description,
  colors = [],
  sizes = [],
  stock = 12,
  featured = false,
  bestseller = false,
  isNew = false,
  tags = [],
  images = [],
}) {
  const id = `prod_${_seq}`
  _seq += 1
  const slug = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
  return {
    id,
    name,
    slug,
    category,
    price,
    promoPrice,
    description,
    shortDescription: description.slice(0, 90) + (description.length > 90 ? '…' : ''),
    colors,
    sizes,
    stock,
    status: 'published',
    featured,
    bestseller,
    isNew,
    tags,
    images,
    seoTitle: `${name} | Linha & Ponto Ateliê de Crochê`,
    seoDescription: description.slice(0, 150),
    order: _seq,
    createdAt: new Date(Date.now() - _seq * 86400000).toISOString(),
  }
}

export const seedProducts = [
  prod({
    name: 'Blusa Amora Trançada',
    category: 'roupas',
    price: 289.9,
    promoPrice: 249.9,
    description:
      'Blusa em crochê fio egípcio com trançados artesanais, caimento leve e acabamento impecável. Peça atemporal, feita à mão fio a fio.',
    colors: ['Terracota', 'Areia', 'Marfim'],
    sizes: ['P', 'M', 'G'],
    featured: true,
    bestseller: true,
    tags: ['verão', 'trançado', 'algodão'],
    images: [local('produtos/blusa-amora.jpg')],
  }),
  prod({
    name: 'Cardigan Aveludado Terra',
    category: 'roupas',
    price: 459.0,
    description:
      'Cardigan longo em ponto alto duplo, toque aveludado e caimento fluido. Ideal para compor looks sofisticados em qualquer estação.',
    colors: ['Caramelo', 'Off-white'],
    sizes: ['P', 'M', 'G', 'GG'],
    featured: true,
    tags: ['inverno', 'cardigan'],
    images: [local('produtos/cardigan-terra.jpg')],
  }),
  prod({
    name: 'Top Cropped Areia',
    category: 'roupas',
    price: 169.9,
    description: 'Top cropped vazado, leve e delicado, perfeito para dias quentes com muito estilo.',
    colors: ['Areia', 'Bege'],
    sizes: ['P', 'M', 'G'],
    isNew: true,
    tags: ['verão', 'vazado'],
    images: [local('produtos/top-areia.jpg')],
  }),
  prod({
    name: 'Bolsa Girassol Artesanal',
    category: 'acessorios',
    price: 219.0,
    description:
      'Bolsa estruturada com alça dupla e forro interno, tramada à mão em fio encerado de alta durabilidade.',
    colors: ['Caramelo', 'Marrom'],
    featured: true,
    bestseller: true,
    tags: ['bolsa', 'dia a dia'],
    images: [local('produtos/bolsa-girassol.jpg')],
  }),
  prod({
    name: 'Chapéu Palha Fina',
    category: 'acessorios',
    price: 139.9,
    description: 'Chapéu de aba média em fio rústico, leve e resistente, com acabamento artesanal refinado.',
    colors: ['Natural'],
    sizes: ['Único'],
    isNew: true,
    tags: ['verão', 'praia'],
    images: [local('produtos/chapeu-palha.jpg')],
  }),
  prod({
    name: 'Cinto Trança Dourada',
    category: 'acessorios',
    price: 99.9,
    description: 'Cinto fino trançado com fivela artesanal em tom dourado fosco, acabamento nobre.',
    colors: ['Dourado', 'Terracota'],
    tags: ['acessório'],
    images: [local('produtos/cinto-tranca.jpg')],
  }),
  prod({
    name: 'Almofada Mandala Terracota',
    category: 'decoracao',
    price: 159.0,
    description: 'Almofada com mandala em relevo, tramada em algodão premium. Traz aconchego e sofisticação à decoração.',
    colors: ['Terracota', 'Areia'],
    bestseller: true,
    tags: ['casa', 'mandala'],
    images: [local('produtos/almofada-mandala.jpg')],
  }),
  prod({
    name: 'Manta Aconchego Caramelo',
    category: 'decoracao',
    price: 329.0,
    promoPrice: 289.0,
    description: 'Manta ponto alto em fio grosso, extremamente macia, perfeita para tardes de inverno com estilo.',
    colors: ['Caramelo', 'Marrom Suave'],
    featured: true,
    tags: ['casa', 'inverno'],
    images: [local('produtos/manta-caramelo.jpg')],
  }),
  prod({
    name: 'Jogo de Sousplat Trançado',
    category: 'decoracao',
    price: 189.0,
    description: 'Conjunto com 4 sousplats trançados à mão, elegantes para compor a mesa posta.',
    colors: ['Natural', 'Bege'],
    tags: ['mesa posta'],
    images: [local('produtos/sousplat.jpg')],
  }),
  prod({
    name: 'Manta de Bebê Nuvem',
    category: 'enxovais',
    price: 249.0,
    description: 'Manta ultra macia em fio hipoalergênico, ideal para o enxoval do bebê com todo carinho artesanal.',
    colors: ['Off-white', 'Rosa Suave', 'Azul Suave'],
    featured: true,
    tags: ['bebê', 'enxoval'],
    images: [local('produtos/manta-nuvem.jpg')],
  }),
  prod({
    name: 'Sapatinho Primeiros Passos',
    category: 'enxovais',
    price: 89.0,
    description: 'Sapatinhos delicados em algodão macio, perfeitos para os primeiros passinhos do bebê.',
    colors: ['Marfim', 'Caramelo Claro'],
    sizes: ['0-3m', '3-6m'],
    isNew: true,
    tags: ['bebê'],
    images: [local('produtos/sapatinho-bebe.jpg')],
  }),
  prod({
    name: 'Vestido Sob Medida Elegance',
    category: 'personalizados',
    price: 549.0,
    description: 'Vestido 100% personalizado — escolha cor, comprimento e detalhes. Uma peça única, feita especialmente para você.',
    colors: ['A combinar'],
    sizes: ['Sob medida'],
    featured: true,
    tags: ['exclusivo', 'sob encomenda'],
    images: [local('produtos/vestido-elegance.jpg')],
  }),
  prod({
    name: 'Kit Presente Encantar',
    category: 'presentes',
    price: 199.0,
    description: 'Kit com porta-chaves, sachê perfumado e mini mandala, embalados em caixa artesanal premium.',
    colors: ['Areia', 'Terracota'],
    bestseller: true,
    tags: ['presente'],
    images: [local('produtos/kit-encantar.jpg')],
  }),
  prod({
    name: 'Miniatura Vaso Flor Eterna',
    category: 'presentes',
    price: 79.0,
    description: 'Vasinho decorativo com flor de crochê eterna, feito à mão em detalhes minuciosos.',
    colors: ['Terracota', 'Amarelo Suave'],
    isNew: true,
    tags: ['presente', 'decoração'],
    images: [local('produtos/vaso-flor.jpg')],
  }),
]

export const seedTestimonials = [
  {
    id: 't1',
    name: 'Marina Salles',
    role: 'Cliente • São Paulo, SP',
    text: 'A blusa que comprei é ainda mais linda pessoalmente. Dá para sentir o cuidado em cada ponto. Já é minha peça favorita do guarda-roupa.',
    rating: 5,
    avatar: ph(200, 200, 'E4D4B8', '523A2B', 'MS'),
    featured: true,
  },
  {
    id: 't2',
    name: 'Camila Duarte',
    role: 'Cliente • Belo Horizonte, MG',
    text: 'Encomendei a manta de bebê personalizada e recebi antes do prazo, com uma embalagem impecável. Qualidade de dar inveja.',
    rating: 5,
    avatar: ph(200, 200, 'EFE3CE', '6B4F3D', 'CD'),
    featured: true,
  },
  {
    id: 't3',
    name: 'Fernanda Rocha',
    role: 'Cliente • Curitiba, PR',
    text: 'Atendimento maravilhoso do início ao fim. A bolsa é resistente, linda e recebo elogios toda vez que uso.',
    rating: 5,
    avatar: ph(200, 200, 'D6C09E', '3D2B20', 'FR'),
    featured: true,
  },
  {
    id: 't4',
    name: 'Juliana Prado',
    role: 'Cliente • Rio de Janeiro, RJ',
    text: 'Comprei o cardigan para o inverno e é simplesmente perfeito — quentinho, elegante e muito bem feito.',
    rating: 5,
    avatar: ph(200, 200, 'F5EEE1', '523A2B', 'JP'),
    featured: false,
  },
  {
    id: 't5',
    name: 'Beatriz Lima',
    role: 'Cliente • Porto Alegre, RS',
    text: 'Já é a terceira peça que compro. A qualidade é sempre impecável e o acabamento surpreende a cada detalhe.',
    rating: 5,
    avatar: ph(200, 200, 'D7AE7C', '3D2B20', 'BL'),
    featured: false,
  },
  {
    id: 't6',
    name: 'Helena Castro',
    role: 'Cliente • Florianópolis, SC',
    text: 'O vestido sob medida ficou exatamente como eu sonhei. Fios lindos, caimento perfeito e um carinho no atendimento que faz toda a diferença.',
    rating: 5,
    avatar: ph(200, 200, 'E4D4B8', '523A2B', 'HC'),
    featured: true,
  },
]

export const seedFaqs = [
  {
    id: 'f1',
    question: 'Quanto tempo leva para produzir uma peça personalizada?',
    answer:
      'O prazo médio é de 7 a 15 dias úteis, dependendo da complexidade da peça. Encomendas com prazos especiais podem ser combinadas diretamente conosco.',
  },
  {
    id: 'f2',
    question: 'Como funciona a personalização de cores e tamanhos?',
    answer:
      'Após a escolha do modelo, você define cor, tamanho e pequenos ajustes através do nosso atendimento. Cada peça é feita sob medida com muito cuidado.',
  },
  {
    id: 'f3',
    question: 'Vocês enviam para todo o Brasil?',
    answer:
      'Sim! Enviamos para todo o território nacional com embalagem protegida e cuidadosa, para que sua peça chegue em perfeito estado.',
  },
  {
    id: 'f4',
    question: 'Qual o cuidado necessário com as peças de crochê?',
    answer:
      'Recomendamos lavagem à mão com sabão neutro e secagem à sombra, na horizontal, para preservar o formato e a textura da peça.',
  },
  {
    id: 'f5',
    question: 'Posso solicitar um orçamento sem compromisso?',
    answer:
      'Claro! Basta preencher o formulário de contato ou nos chamar no WhatsApp contando sua ideia, que retornamos com todos os detalhes.',
  },
  {
    id: 'f6',
    question: 'As peças têm garantia de qualidade?',
    answer:
      'Sim, todas as peças passam por rigorosa conferência de acabamento antes do envio, garantindo qualidade e durabilidade.',
  },
]

export const seedBanners = {
  hero: {
    eyebrow: 'Feito à mão, ponto a ponto',
    title: 'Crochê autoral que veste histórias e aquece momentos',
    subtitle:
      'Peças exclusivas, personalizadas e produzidas artesanalmente com fios selecionados — para quem valoriza exclusividade, delicadeza e qualidade em cada detalhe.',
    primaryCta: 'Ver coleção',
    primaryCtaLink: '/loja',
    secondaryCta: 'Solicitar orçamento',
    secondaryCtaLink: '#contato',
    image: local('banners/hero.jpg'),
  },
  carousel: [
    {
      id: 'carousel_1',
      title: 'Roupas em crochê autoral',
      subtitle: 'Blusas e cardigans feitos fio a fio para vestir com exclusividade.',
      image: local('banners/carousel-1.jpg'),
      ctaLabel: 'Ver roupas',
      ctaLink: '/loja?categoria=roupas',
    },
    {
      id: 'carousel_2',
      title: 'Acessórios que finalizam o look',
      subtitle: 'Bolsas, chapéus e peças tramadas à mão para o dia a dia.',
      image: local('banners/carousel-2.jpg'),
      ctaLabel: 'Ver acessórios',
      ctaLink: '/loja?categoria=acessorios',
    },
    {
      id: 'carousel_3',
      title: 'Aconchego para a casa',
      subtitle: 'Mantas, almofadas e detalhes que aquecem cada ambiente.',
      image: local('banners/carousel-3.jpg'),
      ctaLabel: 'Ver decoração',
      ctaLink: '/loja?categoria=decoracao',
    },
    {
      id: 'carousel_4',
      title: 'Presentes e enxovais delicados',
      subtitle: 'Peças especiais para celebrar momentos que importam.',
      image: local('banners/carousel-4.jpg'),
      ctaLabel: 'Ver coleção',
      ctaLink: '/loja',
    },
  ],
  promo: {
    title: 'Peças sob encomenda para ocasiões especiais',
    subtitle: 'Do casamento ao chá de bebê, criamos peças únicas para o seu momento.',
    image: local('banners/promo.jpg'),
    ctaLabel: 'Fale conosco',
    ctaLink: '#contato',
  },
}

export const seedSettings = {
  siteName: 'Linha & Ponto',
  tagline: 'Ateliê de Crochê Artesanal',
  aboutTitle: 'Cada peça carrega uma história tecida à mão',
  aboutText:
    'Nascemos da paixão por transformar fios em peças que contam histórias. No Ateliê Linha & Ponto, cada item é confeccionado manualmente, com atenção total aos detalhes, respeitando o tempo natural do artesanato. Não trabalhamos com produção em série: cada peça é única, exclusiva e carrega a marca de quem a fez — por isso, valorizamos o tempo, o material selecionado e a técnica refinada em cada ponto.',
  aboutImage: local('sobre-atelie.jpg'),
  aboutHighlights: [
    { label: 'Peças produzidas', value: '2.400+' },
    { label: 'Clientes satisfeitas', value: '1.100+' },
    { label: 'Anos de ofício', value: '12' },
  ],
  email: 'contato@linhaeponto.com.br',
  phone: '(11) 98888-4455',
  whatsapp: '5511988884455',
  instagram: '@linhaeponto.atelie',
  facebook: 'linhaepontoatelie',
  address: 'São Paulo, SP — Atendimento sob agendamento',
  footerText:
    'Peças artesanais em crochê, feitas à mão com fios selecionados. Exclusividade e delicadeza em cada detalhe.',
  ctaTitle: 'Pronta para vestir uma peça feita especialmente para você?',
  ctaSubtitle: 'Fale com nosso ateliê e monte sua peça personalizada ou tire dúvidas sobre nossa coleção.',
  benefits: [
    { title: '100% Artesanal', desc: 'Cada peça é feita à mão, fio a fio, sem produção em série.' },
    { title: 'Personalização Total', desc: 'Cores, tamanhos e detalhes sob medida para você.' },
    { title: 'Envio Cuidadoso', desc: 'Embalagem protegida com identidade visual exclusiva.' },
    { title: 'Peças Exclusivas', desc: 'Edições limitadas que valorizam sua individualidade.' },
    { title: 'Acabamento Premium', desc: 'Fios selecionados e conferência rigorosa de qualidade.' },
    { title: 'Atendimento Próximo', desc: 'Suporte humano do primeiro contato até a entrega.' },
  ],
}

export const seedOrders = [
  {
    id: 'ord_1',
    customerName: 'Patrícia Nogueira',
    contact: '(11) 97777-2233',
    email: 'patricia.n@email.com',
    items: 'Blusa Amora Trançada (M, Terracota)',
    total: 249.9,
    status: 'novo',
    type: 'pedido',
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    id: 'ord_2',
    customerName: 'Renata Costa',
    contact: '(21) 96666-1122',
    email: 'renata.costa@email.com',
    items: 'Orçamento: Vestido sob medida para casamento',
    total: null,
    status: 'em_andamento',
    type: 'orcamento',
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: 'ord_3',
    customerName: 'Ana Beatriz Souza',
    contact: '(31) 95555-9988',
    email: 'ana.beatriz@email.com',
    items: 'Manta de Bebê Nuvem (Rosa Suave) + Sapatinho (0-3m)',
    total: 338.0,
    status: 'concluido',
    type: 'pedido',
    createdAt: new Date(Date.now() - 8 * 86400000).toISOString(),
  },
  {
    id: 'ord_4',
    customerName: 'Larissa Martins',
    contact: '(41) 94444-7766',
    email: 'larissa.m@email.com',
    items: 'Kit Presente Encantar',
    total: 199.0,
    status: 'cancelado',
    type: 'pedido',
    createdAt: new Date(Date.now() - 12 * 86400000).toISOString(),
  },
]

export const seedUsers = [
  {
    id: 'user_admin',
    name: 'Administradora do Ateliê',
    email: 'admin@linhaeponto.com',
    password: 'crochedelicado',
    role: 'admin',
    status: 'ativo',
    avatar: ph(200, 200, 'D6C09E', '3D2B20', 'AT'),
  },
  {
    id: 'user_editor',
    name: 'Equipe de Conteúdo',
    email: 'editor@linhaeponto.com',
    password: 'editor123',
    role: 'editor',
    status: 'ativo',
    avatar: ph(200, 200, 'EFE3CE', '6B4F3D', 'EC'),
  },
]
